import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationError } from 'apollo-server';
import get from 'lodash.get';
import { ConfigService } from 'nestjs-config';
import { RedisService } from 'nestjs-redis';
import { MailService } from '../../../core/mailer';
import {
  USER_VALIDATION_ERROR,
  VALIDATION_ERROR,
} from '../../../core/types/validation.type';
import { AppService } from '../../app.service';
import {
  REDIS_CONFIRM_TOKEN_PREFIX,
  REDIS_FORGOT_PASSWORD_TOKEN_PREFIX,
  REDIS_LOGIN_OTP_PREFIX,
  USER_STATUS_ACTIVE,
} from '../../constants';
import { AuthService } from '../auth/auth.service';
import { GqlAuthGuard } from '../auth/guards/graphql.auth.guard';
import { AuthPayload } from './dto/auth.payload';
import { ChangePasswordArgs } from './dto/change.password.args';
import { LoginArgs } from './dto/login.args';
import { ResetPasswordArgs } from './dto/reset.password.args';
import { UserCreateInput } from './dto/user.create.input';
import {
  LoginResult,
  MeResult,
  MutateUserResult,
  SignupResult,
} from './dto/user.union.types';
import { User } from './models/user.entity';
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
    @Context() ctx,
  ): Promise<typeof LoginResult> {
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
      delete user.password;
      const refreshToken = await this.authService.createRefreshToken(user);
      this.authService.sendRefreshToken(
        ctx.res,
        refreshToken,
        this.configService.get('jwt'),
      );
      return { token, tokenExpiry, user };
    } catch (e) {
      this.appService.handleInternalError(e);
    }
  }

  @Mutation(() => Boolean)
  async sendLoginOTP(@Args('email') email: string): Promise<boolean> {
    // send mail with defined transport object
    try {
      const user: User = await this.userService.findByEmail(email);
      if (!user) {
        return false;
      }
      const info = this.mailService.sendOTPEmail(
        email,
        user.id,
        'Login OTP for Genesis',
      );
      return info !== null;
    } catch (error) {
      this.appService.handleInternalError(error);
    }
    return false;
  }

  @Mutation(() => LoginResult)
  async loginWithOTP(
    @Args() loginArgs: LoginArgs,
    @Context() ctx,
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
      delete user.password;
      const refreshToken = await this.authService.createRefreshToken(user);
      this.authService.sendRefreshToken(
        ctx.res,
        refreshToken,
        this.configService.get('jwt'),
      );
      return { token, tokenExpiry, user };
    } catch (error) {
      this.appService.handleInternalError(error);
    }
  }

  @Query(() => MeResult)
  @UseGuards(GqlAuthGuard)
  async me(@Context() ctx): Promise<typeof MeResult> {
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
      this.appService.thorwInternalError(e);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutfromAllDevices(@Context() ctx) {
    try {
      const user: User = get(ctx, 'req.user', null);
      if (user) {
        await User.update(
          { tokenVersion: user.tokenVersion + 1 },
          { id: user.id },
        );
        return true;
      } else {
        this.appService.throwAuthenticationError();
      }
    } catch (e) {
      this.appService.handleInternalError(e);
    }
    return false;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@Context() ctx) {
    try {
      const secure = this.configService.get('api').isSecure;
      ctx.res.cookie('gid', '', {
        httpOnly: true,
        expires: new Date(0),
        secure,
        domain: secure ? '.genesis.dev' : 'localhost',
      });
      ctx.res.cookie('selectedProjectId', '', {
        httpOnly: true,
        expires: new Date(0),
        secure,
        domain: secure ? '.genesis.dev' : 'localhost',
      });
      ctx.res.cookie('selectedWorkspaceId', '', {
        httpOnly: true,
        expires: new Date(0),
        secure,
        domain: secure ? '.genesis.dev' : 'localhost',
      });
      ctx.res.cookie('selectedProjectContentId', '', {
        httpOnly: true,
        expires: new Date(0),
        secure,
        domain: secure ? '.genesis.dev' : 'localhost',
      });

      return true;
    } catch (error) {
      this.appService.handleInternalError(error);
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
      const result = await this.mailService.sendForgotPasswordEmail(
        email,
        user.id,
      );
      return { success: result !== null };
    } catch (error) {
      this.appService.handleInternalError(error);
    }
    return { success: true };
  }

  @Mutation(() => MutateUserResult)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args() changePasswordArgs: ChangePasswordArgs,
    @Context() ctx,
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
        this.appService.thorwInternalError(error);
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
      this.appService.handleInternalError(error);
    }
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Context() ctx): Promise<AuthPayload> {
    const gid = get(ctx, 'req.cookies.gid', null);
    if (!gid) {
      throw new AuthenticationError('Invalid refresh token');
    }

    let user: User = null;
    let payload: any = {};
    try {
      payload = await this.jwtService.verify(gid);
      user = await this.userService.findById(payload.id);
    } catch (err) {
      this.appService.thorwInternalError(err);
    }
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      this.appService.throwAuthenticationError('Invalid refresh token');
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
    delete user.password;
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
    @Args('userCreateInput') userCreateInput: UserCreateInput,
    // @Context() ctx,
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
        // const loginToken = await this.authService.createToken(user);
        // const tokenExpiry = new Date(
        //   new Date().getTime() +
        //     get(
        //       this.configService.get('jwt'),
        //       'accessToken.options.expiresIn',
        //       15 * 60,
        //     ) *
        //       1000,
        // );
        // delete user.password;
        // const refreshToken = await this.authService.createRefreshToken(user);
        // this.authService.sendRefreshToken(
        //   ctx.res,
        //   refreshToken,
        //   this.configService.get('jwt'),
        // );
        // return { token: loginToken, tokenExpiry, user };
        return { token: '', tokenExpiry: new Date(0), user };
      }
    } catch (error) {
      this.appService.thorwInternalError(error);
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
      this.appService.thorwInternalError(error);
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
      const result = await this.mailService.sendConfirmationEmail(
        user.name,
        email,
        user.id,
      );
      return { success: result !== null };
    } catch (error) {
      this.appService.thorwInternalError(error);
    }
    return { success: true };
  }
}
