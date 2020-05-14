// bootstrap.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';

@Module({
  imports: [ConfigModule.load(resolve('src/config', '**/!(*.d).{ts,js}'))],
})
export class BootstrapModule {}
