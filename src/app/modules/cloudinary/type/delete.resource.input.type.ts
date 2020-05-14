import { InputType, Field } from '@nestjs/graphql';

@InputType({
  description: 'Deletes multiple cloudinary resource related to an user',
})
export default class DeleteResourceInput {
  @Field(() => [String])
  publicIds: string[];

  @Field({ nullable: true })
  projectContentId?: string;
}
