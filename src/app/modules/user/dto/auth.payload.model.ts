import { ObjectType } from '@nestjs/graphql';
import User from '../models/user.entity';

@ObjectType()
export class AuthPayload {
  token: string;
  tokenExpiry: Date;
  user: User;
}
