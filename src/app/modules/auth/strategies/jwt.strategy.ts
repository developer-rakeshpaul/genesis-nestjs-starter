import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from './../../user/user.service';

// import { UserService } from '@modules/user';

export interface JwtPayload {
  id: string;
  hash: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwt').accessToken.secret,
    });
    this.config = config;
    this.userService = userService;
  }

  async validate({ id }: JwtPayload) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

export const callback = (err, user, info) => {
  let message;
  if (err) {
    return err || new UnauthorizedException(info.message);
  } else if (typeof info !== 'undefined' || !user) {
    switch (info.message) {
      case 'No auth token':
      case 'invalid signature':
      case 'jwt malformed':
      case 'invalid token':
      case 'invalid signature':
        message = 'You must provide a valid authenticated access token';
        break;
      case 'jwt expired':
        message = 'Your session has expired';
        break;
      default:
        message = info.message;
        break;
    }
    throw new UnauthorizedException(message);
  }
  return user;
};
