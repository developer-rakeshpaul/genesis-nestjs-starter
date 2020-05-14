import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { resolve } from 'path';
import { AuthModule } from '../app/modules/auth/auth.module';
import { User } from '../app/modules/user/models/user.entity';
import { UserService } from '../app/modules/user/user.service';
import { LoggerModule } from '../core/logger/logger.module';
import { MailService } from '../core/mailer/mailer.service';
import { MailModule } from './../core/mailer/mailer.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, '../config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, ,]),
    LoggerModule,
    MailModule,
    forwardRef(() => AuthModule),
  ],
  exports: [],
  providers: [MailService, SeederService, UserService],
})
export class SeedModule {
  // constructor(private readonly connection: Connection) {}
}
