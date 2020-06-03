import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class ActionResult {
  @Field()
  success: boolean;

  @Field(() => GraphQLJSONObject)
  info?: any
}
