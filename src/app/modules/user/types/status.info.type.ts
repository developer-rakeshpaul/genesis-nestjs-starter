import { ObjectType, Field } from "@nestjs/graphql";
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class StatusWithInfo {
  @Field()
  status: boolean;

  @Field(() => GraphQLJSONObject)
  info?: any
}