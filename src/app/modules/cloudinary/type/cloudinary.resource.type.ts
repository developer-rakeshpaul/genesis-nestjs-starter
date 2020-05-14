import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export default class CloudinaryResource {
  @Field({ nullable: true })
  public_id?: string;

  @Field({ nullable: true })
  format?: string;

  @Field({ nullable: true })
  version?: number;

  @Field({ nullable: true })
  resource_type?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  created_at?: string;

  @Field({ nullable: true })
  bytes?: number;

  @Field({ nullable: true })
  width?: number;

  @Field({ nullable: true })
  height?: number;

  @Field({ nullable: true })
  access_mode?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  secure_url?: string;
}
