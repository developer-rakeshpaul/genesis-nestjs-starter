import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_STATUS_ACTIVE } from './../app/constants';
/* eslint-disable @typescript-eslint/camelcase */
import { User } from './../app/modules/user/models/user.entity';
import { UserService } from './../app/modules/user/user.service';
import { MailService } from './../core/mailer/mailer.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}
  async seed() {
    try {
      const completed = await this.setup();
      this.logger.debug('Successfuly completed seeding users...');
      Promise.resolve(completed);
    } catch (error) {
      this.logger.error('Failed seeding users and resources...');
      Promise.reject(error);
    }
  }

  async setup() {
    try {
      const emails = this.configService.get('api').emails();
      const superadmins: Array<Partial<User>> = emails.map((email: string) => {
        return {
          name: 'Super Admin',
          email,
          status: USER_STATUS_ACTIVE,
          emailVerified: true,
          role: 'admin',
        };
      });
      const createdUsers = await Promise.all(
        this.userService.createAll(superadmins),
      );
      const savedUsers = await this.userService.saveAll(
        createdUsers.filter((r) => r !== null),
      );
      await Promise.all(
        savedUsers.map((user) => {
          return this.mailService.sendSuperAdminEmail(user.email, user.id);
        }),
      );
      this.logger.debug(
        'No. of superadmins : ' + savedUsers.length,
        // Remove all null values and return only created languages.
      );

      return Promise.resolve(true);
    } catch (error) {
      console.log(error);
      Promise.reject(error);
    }
  }
}
