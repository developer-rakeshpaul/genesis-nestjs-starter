import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();
export class GraphqlOptions implements GqlOptionsFactory {
  createGqlOptions(): Promise<GqlModuleOptions> | GqlModuleOptions {
    const origin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : 'http://localhost:3000';

    return {
      cors: {
        origin,
        credentials: true,
      },
      autoSchemaFile: './schema.graphql',
      path: '/',
      installSubscriptionHandlers: true,
      playground: process.env.NODE_ENV === 'development',
      context: ({ req, res }: any) => ({
        req,
        res,
      }),
      // formatError: (error: GraphQLError) => {
      //   if (error.originalError instanceof ApolloError) {
      //     return error;
      //   }

      //   const errId = v4();
      //   console.log('errId: ', errId);
      //   console.log(JSON.stringify(error, null, 2));
      //   return new GraphQLError(`Internal Error: ${errId} => ${error.message}`);
      // },
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
    };
  }
}
