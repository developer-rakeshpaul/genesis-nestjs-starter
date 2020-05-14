import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ResetPasswordArgs {
  @Field()
  password: string;

  @Field()
  token: string;
}
