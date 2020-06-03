import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ChangePasswordArgs {
  password: string;
  currentPassword: string;
}
