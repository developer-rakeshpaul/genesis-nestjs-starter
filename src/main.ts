import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import 'module-alias/register';
import { AppModule } from './app/app.module';
config();

// Startup
(async function bootstrap() {
  try {
    process.on('warning', (e) => console.warn(e.stack));
    const origin = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : 'http://localhost:3000';
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin,
        credentials: true,
      },
    });
    app.use(compression());
    app.use(helmet());
    app.use(cookieParser());
    // app.enableCors();
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 100 requests per windowMs
      }),
    );

    await app.listen(parseInt(process.env.API_PORT, 10) || 4000);
    console.info(
      `Application started successfully on port ${
        parseInt(process.env.API_PORT, 10) || 4000
      }`,
    );
  } catch (error) {
    console.error('error', error);
  }
})();
