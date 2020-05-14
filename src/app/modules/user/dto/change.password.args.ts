import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ChangePasswordArgs {
  @Field()
  password: string;

  @Field()
  currentPassword: string;
}
