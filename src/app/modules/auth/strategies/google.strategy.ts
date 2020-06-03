import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserService } from '../../user';
import { UserCreateInput } from '../../user/dto/user.create.input';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get('social').google.clientID,
      clientSecret: config.get('social').google.clientSecret,
      callbackURL:
        config.get('social').google.callback ||
        'http://localhost:4000/auth/google/callback',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  buildCreateUserInput(profile: Profile): UserCreateInput {
    const { id, displayName, emails, photos } = profile;
    return {
      email: emails[0].value,
      name: displayName,
      googleId: id,
      imageUrl: photos[0].value,
      status: 'active',
    };
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (...args) => {},
  ) {
    try {
      let user = await this.userService.findOne({
        where: {
          googleId: profile.id,
        },
      });
      if (!user) {
        const createUserInput = this.buildCreateUserInput(profile);
        user = await this.userService.findByEmail(createUserInput.email);
        if (!user) {
          user = await this.userService.create(createUserInput);
        }
      }

      done(null, user);
    } catch (err) {
      // console.log(err)
      done(err, false);
    }
  }
}
