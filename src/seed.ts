import { Logger } from './core/logger/logger';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module';
import { SeederService } from './seed/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule, {
    logger: console,
  });
  app.useLogger(new Logger());
  const logger = await app.resolve(Logger);
  try {
    const seeder = app.get(SeederService);
    await seeder.seed();
    logger.debug('Seeding complete!');
    app.close();
  } catch (error) {
    logger.error('Seeding failed!', error);
    logger.log(error);
  }
}
bootstrap();
