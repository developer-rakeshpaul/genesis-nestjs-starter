import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import FacebookTokenStrategy from 'passport-facebook-token';
import { UserService } from '../../user';
import { UserCreateInput } from '../../user/dto/user.create.input';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  FacebookTokenStrategy,
  'facebook',
) {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get('social').facebook.clientID,
      clientSecret: config.get('social').facebook.clientSecret,
      passReqToCallback: true,
      profileFields: ['displayName', 'emails', 'id', 'name', 'photos'],
    });
  }

  buildCreateUserInput(profile: any): UserCreateInput {
    const { id, displayName, emails, photos } = profile;
    return {
      email: emails[0].value,
      name: displayName,
      facebookId: id,
      imageUrl: photos[0].value,
      status: 'active',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (...args) => {},
  ) {
    try {
      let user = await this.userService.findOne({
        where: {
          facebookId: profile.id,
        },
      });
      if (!user) {
        const createUserInput = this.buildCreateUserInput(profile);
        user = await this.userService.findByEmail(createUserInput.email);
        if (!user) {
          user = await this.userService.create(createUserInput);
        }
      }

      done(null, { user, accessToken, refreshToken });
    } catch (err) {
      // console.log(err)
      done(err, false);
    }
  }
}
