import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-github';
import { UserService } from '../../user';
import { UserCreateInput } from '../../user/dto/user.create.input';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      clientID: config.get('social').github.clientID,
      clientSecret: config.get('social').github.clientSecret,
      callbackURL:
        config.get('social').github.callback ||
        'http://localhost:4000/auth/github/callback',
    });
  }

  buildCreateUserInput(profile: any): UserCreateInput {
    const { id, displayName, emails, photos } = profile;
    return {
      email: emails[0].value,
      name: displayName,
      githubId: id,
      imageUrl: photos[0].value,
      status: 'active',
    };
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (...args) => {},
  ) {
    try {
      let user = await this.userService.findOne({
        where: {
          githubId: profile.id,
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
