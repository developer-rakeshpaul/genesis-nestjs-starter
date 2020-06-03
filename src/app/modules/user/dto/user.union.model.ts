import { createUnionType } from '@nestjs/graphql';
import { ActionResult } from '../../../../core/types/action.model';
import { ValidationResult } from '../../../../core/types/validation.model';
import { User } from '../models/user.entity';
import { AuthPayload } from './auth.payload.model';

export const MutateUserResult = createUnionType({
  name: 'MutateUserResult', // the name of the GraphQL union
  types: () => [ActionResult, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('code' in value) {
      return ValidationResult; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('success' in value) {
      return ActionResult; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export const LoginResult = createUnionType({
  name: 'LoginResult', // the name of the GraphQL union
  types: () => [AuthPayload, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('code' in value) {
      return ValidationResult; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('user' in value || 'token' in value || 'tokenExpiry' in value) {
      return AuthPayload; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export const MeResult = createUnionType({
  name: 'MeResult', // the name of the GraphQL union
  types: () => [User, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('code' in value) {
      return ValidationResult; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('id' in value || 'email' in value || 'username' in value) {
      return User; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export const ConfirmCollaboratorResult = createUnionType({
  name: 'ConfirmCollaboratorResult', // the name of the GraphQL union
  types: () => [AuthPayload, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('user' in value || 'token' in value) {
      return AuthPayload; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('code' in value) {
      return ValidationResult; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export const CollaboratorCreateResult = createUnionType({
  name: 'CollaboratorCreateResult', // the name of the GraphQL union
  types: () => [User, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('code' in value) {
      return ValidationResult; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('id' in value) {
      return User; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export const SignupResult = createUnionType({
  name: 'SignupResult', // the name of the GraphQL union
  types: () => [AuthPayload, ValidationResult], // function that returns array of object types classes
  // our implementation of detecting returned object type
  resolveType: (value) => {
    if ('code' in value) {
      return ValidationResult; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('user' in value || 'token' in value) {
      return AuthPayload; // or the schema name of the type as a string
    }
    return undefined;
  },
});
