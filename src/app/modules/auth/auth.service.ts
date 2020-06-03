import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationError } from 'apollo-server';
import { Response } from 'express';
import get from 'lodash.get';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/user/models/user.entity';
import { UserService } from '../user/user.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne({
      where: {
        email,
        // status: USER_STATUS_ACTIVE,
      },
    });
    if (!user) return null;

    const valid = await this.cryptoService.checkPassword(
      user.password,
      password,
    );
    if (valid) {
      delete user.password;
      return user;
    }
  }

  public async createToken(user: User) {
    const timeInMs = Math.floor(Date.now() / 1000);
    const iat = timeInMs - 30;
    const claims = {
      'x-hasura-allowed-roles': [user.role],
      'x-hasura-default-role': user.role,
      'x-hasura-user-id': user.id,
      // 'x-hasura-custom': 'custom-value',
    };

    const payload = {
      // tslint:disable-next-line: object-literal-key-quotes
      id: user.id,
      // tslint:disable-next-line:object-literal-key-quotes
      tokenVersion: user.tokenVersion,
      iat,
      'https://hasura.io/jwt/claims': claims,
    };

    const accessToken = await this.jwtService.sign(
      payload,
      this.configService.get('jwt').accessToken.options,
    );
    return accessToken;
  }

  public async createRefreshToken(user: User) {
    const timeInMs = Math.floor(Date.now() / 1000);
    const iat = timeInMs - 30;
    const payload = {
      id: user.id,
      tokenVersion: user.tokenVersion,
      iat,
    };
    const refreshToken = await this.jwtService.sign(
      payload,
      this.configService.get('jwt').refreshToken.options,
    );
    return refreshToken;
  }

  public sendRefreshToken(res: Response, token: string, jwtConfig: any) {
    const secure = this.configService.get('api').isSecure;
    res.cookie('gid', token, {
      maxAge:
        get(jwtConfig, 'refreshToken.options.expiresIn', 60 * 60 * 24 * 1) *
        1000, // convert from minute to milliseconds
      httpOnly: true,
      secure,
      domain: secure ? '.genesis.dev' : 'localhost',
      // path: '/auth/refresh_token',
    });
  }

  public async getAuthUser(token: string): Promise<User | null> {
    try {
      const payload: any = await this.jwtService.verify(token);
      const user: User = await this.userService.findById(payload.id);
      return user;
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  public async verify(token: string) {
    try {
      const payload: any = await this.jwtService.verify(token);
      const user: User = await this.userService.findById(payload.id);
      return user !== null && user.tokenVersion === payload.tokenVersion;
    } catch (e) {
      console.error(e);
      throw new AuthenticationError('GqlAuthGuard');
    }
  }
}
