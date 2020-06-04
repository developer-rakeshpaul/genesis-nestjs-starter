import {
  UseGuards,
  ValidationPipe,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import get from 'lodash.get';
import { RedisService } from 'nestjs-redis';
import { getTestMessageUrl } from 'nodemailer';
import {
  MailService,
  ResolverContext,
  USER_VALIDATION_ERROR,
  VALIDATION_ERROR,
} from '../../../core';
import { AppService } from '../../app.service';
import {
  REDIS_CONFIRM_TOKEN_PREFIX,
  REDIS_FORGOT_PASSWORD_TOKEN_PREFIX,
  REDIS_LOGIN_OTP_PREFIX,
  USER_STATUS_ACTIVE,
} from '../../constants';
import { AuthService, GqlAuthGuard } from '../auth';
import {
  AuthPayload,
  ChangePasswordArgs,
  LoginArgs,
  ResetPasswordArgs,
  UserCreateInput,
  LoginResult,
  MeResult,
  MutateUserResult,
  SignupResult,
} from './dto';

import { User } from './models';
import { StatusWithInfo } from './types/status.info.type';
import { UserService } from './user.service';

// const emptyValidationResult = { code: null, message: null };
// const emptyAuthPayload = { token: null, tokenExpiry: null, user: null };

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Mutation(() => LoginResult)
  async login(
    @Args() loginArgs: LoginArgs,
    @Context() ctx: ResolverContext,
  ): Promise<typeof LoginResult> {
    console.log(ctx.req.user);
    const { email, password } = loginArgs;
    const user: User = await this.authService.validateUser(email, password);

    if (!user) {
      return {
        code: USER_VALIDATION_ERROR.INVALID_LOGIN_CREDENTIALS,
        message: 'Invalid login credentials',
        // ...emptyAuthPayload,
      };
    }
    if (user && user.status !== USER_STATUS_ACTIVE) {
      return {
        code: USER_VALIDATION_ERROR.EMAIL_NOT_VERIFIED,
        message: 'Email not verified',
        // ...emptyAuthPayload,
      };
    }

    try {
      await this.userService.update(
        {
          lastLoginAt: new Date(),
        },
        {
          id: user.id,
        },
      );
      const token = await this.authService.createToken(user);
      const tokenExpiry = new Date(
        new Date().getTime() +
          get(
            this.configService.get('jwt'),
            'accessToken.options.expiresIn',
            15 * 60,
          ) *
            1000,
      );
      const refreshToken = await this.authService.createRefreshToken(user);
      this.authService.sendRefreshToken(
        ctx.res,
        refreshToken,
        this.configService.get('jwt'),
      );
      return { token, tokenExpiry, user };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @Mutation(() => StatusWithInfo)
  async sendLoginOTP(@Args('email') email: string): Promise<StatusWithInfo> {
    // send mail with defined transport object
    try {
      const user: User = await this.userService.findByEmail(email);
      if (!user) {
        return { status: false };
      }
      const info = await this.mailService.sendOTPEmail(
        email,
        user.id,
        'Login OTP for Genesis',
      );
      return {
        status: info !== null,
        info: {
          email,
          url: getTestMessageUrl(info),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
      return { status: false };
    }
  }

  @Mutation(() => LoginResult)
  async loginWithOTP(
    @Args() loginArgs: LoginArgs,
    @Context() ctx: ResolverContext,
  ): Promise<typeof LoginResult> {
    const { email, otp } = loginArgs;
    const key = REDIS_LOGIN_OTP_PREFIX + email + otp;
    const redis = this.redisService.getClient();
    const id = await redis.get(key);

    if (!id) {
      return null;
    }
    await redis.del(key);
    const user: User = await this.userService.findById(id);
    if (!user) {
      return {
        code: USER_VALIDATION_ERROR.INVALID_LOGIN_CREDENTIALS,
        message: 'Invalid login credentials',
      };
    }

    try {
      await this.userService.update(
        {
          lastLoginAt: new Date(),
        },
        {
          id: user.id,
        },
      );
      const token = await this.authService.createToken(user);
      const tokenExpiry = new Date(
        new Date().getTime() +
          get(
            this.configService.get('jwt'),
            'accessToken.options.expiresIn',
            15 * 60,
          ) *
            1000,
      );
      const refreshToken = await this.authService.createRefreshToken(user);
      this.authService.sendRefreshToken(
        ctx.res,
        refreshToken,
        this.configService.get('jwt'),
      );
      return { token, tokenExpiry, user };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Query(() => MeResult)
  @UseGuards(GqlAuthGuard)
  async me(@Context() ctx: ResolverContext): Promise<typeof MeResult> {
    try {
      const user: User = get(ctx, 'req.user', null);
      if (user) {
        return user;
      } else {
        return {
          code: VALIDATION_ERROR.UNAUTHORIZED,
          message: 'Not authorized',
        };
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutfromAllDevices(
    @Context() ctx: ResolverContext,
  ): Promise<boolean> {
    try {
      const user: User = get(ctx, 'req.user', null);
      if (user) {
        await User.update(
          { tokenVersion: user.tokenVersion + 1 },
          { id: user.id },
        );
        return true;
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
    return false;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@Context() ctx: ResolverContext): Promise<boolean> {
    try {
      const secure = this.configService.get('api').isSecure;
      ctx.res.cookie('gid', '', {
        httpOnly: true,
        expires: new Date(0),
        secure,
        domain: secure ? '.genesis.dev' : 'localhost',
      });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => MutateUserResult)
  async forgotPassword(
    @Args('email') email: string,
  ): Promise<typeof MutateUserResult> {
    // send mail with defined transport object
    try {
      const user: User = await this.userService.findByEmail(email);
      if (!user) {
        return {
          message: 'Unable to send reset instructions',
          code: USER_VALIDATION_ERROR.EMAIL_NOT_FOUND,
        };
      }
      if (user && !user.emailVerified) {
        // throw this.appService.throwValidationError('Email not verified!');
        await this.mailService.sendConfirmationEmail(user.name, email, user.id);
        return {
          message: 'Email not verified!',
          code: USER_VALIDATION_ERROR.EMAIL_NOT_VERIFIED,
        };
      }
      const info = await this.mailService.sendForgotPasswordEmail(
        email,
        user.id,
      );
      return {
        success: info !== null,
        info: {
          email,
          url: getTestMessageUrl(info),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return { success: true };
  }

  @Mutation(() => MutateUserResult)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args() changePasswordArgs: ChangePasswordArgs,
    @Context() ctx: ResolverContext,
  ): Promise<typeof MutateUserResult> {
    const user = get(ctx, 'req.user', null);
    if (user) {
      const { password, currentPassword } = changePasswordArgs;
      let validUser: User = null;
      try {
        validUser = await this.authService.validateUser(
          user.email,
          currentPassword,
        );
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
      if (validUser) {
        const newPassword = await this.userService.encrypt(password);
        await this.userService.update(
          {
            password: newPassword,
          },
          {
            id: validUser.id,
          },
        );
        return { success: true };
      } else {
        return {
          message: 'Invalid change password data',
          code: VALIDATION_ERROR.INVALID_INPUT,
        };
      }
    } else {
      return {
        message: 'Not authorised to access this resource',
        code: VALIDATION_ERROR.UNAUTHORIZED,
      };
    }
  }

  @Mutation(() => MutateUserResult)
  async resetPassword(
    @Args() resetPasswordArgs: ResetPasswordArgs,
  ): Promise<typeof MutateUserResult> {
    try {
      const { password, token } = resetPasswordArgs;
      const key = REDIS_FORGOT_PASSWORD_TOKEN_PREFIX + token;
      const redis = this.redisService.getClient();
      const id = await redis.get(key);

      if (!id) {
        return { success: false };
      }

      const newPassword = await this.userService.encrypt(password);
      await this.userService.update(
        {
          password: newPassword,
        },
        {
          id,
        },
      );
      await redis.del(key);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Context() ctx: ResolverContext): Promise<AuthPayload> {
    const gid = get(ctx, 'req.cookies.gid', null);
    if (!gid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let user: User = null;
    let payload: any = {};
    try {
      payload = await this.jwtService.verify(gid);
      user = await this.userService.findById(payload.id);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = await this.authService.createToken(user);
    const tokenExpiry = new Date(
      new Date().getTime() +
        get(
          this.configService.get('jwt'),
          'accessToken.options.expiresIn',
          15 * 60,
        ) *
          1000,
    );
    const refreshToken = await this.authService.createRefreshToken(user);
    this.authService.sendRefreshToken(
      ctx.res,
      refreshToken,
      this.configService.get('jwt'),
    );
    return { token, tokenExpiry, user };
  }

  @Mutation(() => SignupResult)
  async signup(
    @Args('userCreateInput', new ValidationPipe())
    userCreateInput: UserCreateInput,
    @Context() ctx: ResolverContext,
  ): Promise<typeof SignupResult> {
    try {
      const { email, username, password } = userCreateInput;

      let user = await this.userService.findByEmail(email);

      const emailExists = await this.userService.exists({ where: { email } });
      if (emailExists) {
        const message = `Email ${email} is already in use`;
        return {
          code: USER_VALIDATION_ERROR.USER_EXISTS,
          message,
        };
      }

      if (username) {
        const usernameExists = await this.userService.exists({
          where: { username },
        });
        if (usernameExists) {
          const message = `Username ${username} is already in use`;
          return {
            code: USER_VALIDATION_ERROR.USER_EXISTS,
            message,
          };
        }
      }

      user = await this.userService.create({
        ...userCreateInput,
        password,
      });
      if (user) {
        await this.mailService.sendConfirmationEmail(
          user.name,
          user.email,
          user.id,
        );
        if (!this.configService.get('api').verificationRequired) {
          const loginToken = await this.authService.createToken(user);
          const tokenExpiry = new Date(
            new Date().getTime() +
              get(
                this.configService.get('jwt'),
                'accessToken.options.expiresIn',
                15 * 60,
              ) *
                1000,
          );
          const refreshToken = await this.authService.createRefreshToken(user);
          this.authService.sendRefreshToken(
            ctx.res,
            refreshToken,
            this.configService.get('jwt'),
          );
          return { token: loginToken, tokenExpiry, user };
        }

        return { token: '', tokenExpiry: new Date(0), user };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => MutateUserResult)
  async confirm(
    @Args('token') token: string,
  ): Promise<typeof MutateUserResult> {
    // send mail with defined transport object
    try {
      const redis = this.redisService.getClient();
      const key = REDIS_CONFIRM_TOKEN_PREFIX + token;
      const id = await redis.get(key);

      if (!id) {
        return { success: false };
      }

      await this.userService.update(
        {
          status: USER_STATUS_ACTIVE,
          emailVerified: true,
        },
        {
          id,
        },
      );
      await redis.del(key);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Mutation(() => MutateUserResult)
  async resendConfirm(
    @Args('email') email: string,
  ): Promise<typeof MutateUserResult> {
    // send mail with defined transport object
    try {
      const user: User = await this.userService.findByEmail(email);
      if (!user) {
        return { success: false };
      }
      const info = await this.mailService.sendConfirmationEmail(
        user.name,
        email,
        user.id,
      );
      return {
        success: info !== null,
        info: {
          email,
          url: getTestMessageUrl(info),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    return { success: true };
  }
}
