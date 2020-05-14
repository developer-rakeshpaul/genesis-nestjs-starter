import { Field, ObjectType } from '@nestjs/graphql';
import User from '../models/user.entity';

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field()
  tokenExpiry: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Field(() => User, { nullable: false })
  user: User;
}
