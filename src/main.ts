import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import 'module-alias/register';
import { AppModule } from './app/app.module';
// Startup
(async function bootstrap() {
  try {
    process.on('warning', (e) => console.warn(e.stack));

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const origin = configService.get('api.corsOrigin')();

    app.enableCors({
      origin,
      credentials: true,
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

    const port = configService.get('api.port', 4000);
    await app.listen(port);
    console.info(`Application started successfully on port ${port}`);
  } catch (error) {
    console.error('error', error);
  }
})();
