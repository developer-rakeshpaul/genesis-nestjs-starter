import { Field, ObjectType } from '@nestjs/graphql';

export enum VALIDATION_ERROR {
  INVALID_INPUT = 'INVALID_INPUT',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export enum USER_VALIDATION_ERROR {
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_LOGIN_CREDENTIALS = 'INVALID_LOGIN_CREDENTIALS',
}

export enum WORKSPACE_VALIDATION_ERROR {
  INVALID_WORKSPACE = 'INVALID_WORKSPACE',
  INVALID_MAGIC_CODE = 'INVALID_MAGIC_CODE',
}

@ObjectType()
export class ValidationResult {
  @Field()
  message: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Field(() => String)
  code: VALIDATION_ERROR | USER_VALIDATION_ERROR | WORKSPACE_VALIDATION_ERROR;
}
