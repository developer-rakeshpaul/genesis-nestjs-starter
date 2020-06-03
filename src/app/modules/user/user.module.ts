import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { MailService } from './../../../core/mailer/mailer.service';
import { AuthModule } from './../auth/auth.module';
import { CommonModule } from './../common/common.module';
import { User } from './models/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('jwt').accessToken,
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService],
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => CommonModule),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver, MailService],
})
export class UserModule {}
