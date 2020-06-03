import { IsEmail, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserCreateInput {
  @IsEmail()
  email: string;

  @IsOptional()
  password?: string;

  name: string;

  username?: string;

  @IsOptional()
  googleId?: string;

  @IsOptional()
  facebookId?: string;

  @IsOptional()
  twitterId?: string;

  @IsOptional()
  githubId?: string;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  lastLoginAt?: Date;
}
