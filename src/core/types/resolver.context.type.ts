import { Response, Request } from 'express';

export interface ResolverContext {
  res: Response;
  req: Request;
}
