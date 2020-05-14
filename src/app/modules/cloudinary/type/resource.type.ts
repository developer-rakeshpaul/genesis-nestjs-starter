import { ObjectType, Field } from '@nestjs/graphql';
import CloudinaryResource from './cloudinary.resource.type';

@ObjectType()
export default class Resources {
  @Field(() => [CloudinaryResource])
  resources: CloudinaryResource[];

  @Field()
  next_cursor: string;
}
