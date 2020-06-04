import { v4 } from 'uuid';
import { ApolloError } from 'apollo-server-fastify';
import { Injectable } from '@nestjs/common';
import {
  AuthenticationError,
  ValidationError,
  UserInputError,
  toApolloError,
} from 'apollo-server';

@Injectable()
export class AppService {
  public hasValidationErrors(validationErrors: object) {
    return Object.keys(validationErrors).length > 0;
  }

  public handleInternalError(error: Error) {
    if (error instanceof ApolloError) {
      throw error;
    }
    const errId = v4();
    console.log('errId: ', errId);
    console.log(error);
    this.thorwInternalError(error);
  }

  public throwValidationError(message) {
    throw new ValidationError(message);
  }

  public throwAuthenticationError(message?: string) {
    throw new AuthenticationError(message);
  }

  public throwUserInputError(message: string, properties?: any) {
    throw new UserInputError(message, properties);
  }
  public thorwInternalError(error) {
    throw toApolloError(error);
  }
}
