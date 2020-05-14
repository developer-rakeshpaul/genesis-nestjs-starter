import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationError } from 'apollo-server';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  private allowedRoles = [];
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.allowedRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!this.allowedRoles || this.allowedRoles.length === 0) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    return super.canActivate(new ExecutionContextHost([req]));
  }

  handleRequest(err: any, user: any) {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new AuthenticationError('Not authorised');
    }
    if (this.allowedRoles && !this.allowedRoles.includes(user.role)) {
      throw new AuthenticationError(
        'Not authorised to access the request resource',
      );
    }
    return user;
  }
}
