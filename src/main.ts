import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from 'fastify-compress';
import cookie from 'fastify-cookie';
import helmet from 'fastify-helmet';
import rateLimit from 'fastify-rate-limit';
import 'module-alias/register';
import { AppModule } from './app/app.module';
// Startup
(async function bootstrap() {
  try {
    process.on('warning', (e) => console.warn(e.stack));

    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );
    const configService = app.get(ConfigService);
    const origin = configService.get('api.corsOrigin')();

    app.enableCors({
      origin,
      credentials: true,
    });
    app.register(compression);
    app.register(helmet);
    app.register(cookie);
    // app.enableCors();
    app.register(rateLimit, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
    });

    const port = configService.get('api.port', 4000);
    await app.listen(port);
    console.info(`Application started successfully on port ${port}`);
  } catch (error) {
    console.error('error', error);
  }
})();
