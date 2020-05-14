import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActionResult {
  @Field()
  success: boolean;
}
