import { IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

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
