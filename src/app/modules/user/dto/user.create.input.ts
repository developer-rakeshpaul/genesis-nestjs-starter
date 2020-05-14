import { IsEmail, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserCreateInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  password?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  googleId?: string;

  @Field({ nullable: true })
  @IsOptional()
  facebookId?: string;

  @Field({ nullable: true })
  @IsOptional()
  twitterId?: string;

  @Field({ nullable: true })
  @IsOptional()
  githubId?: string;

  @Field({ nullable: true })
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  lastLoginAt?: Date;
}
