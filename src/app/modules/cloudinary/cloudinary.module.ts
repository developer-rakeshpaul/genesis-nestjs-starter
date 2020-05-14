import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { resolve } from 'path';
import { CloudinaryResolver } from './cloudinary.resolver';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    ConfigModule.load(
      resolve(__dirname, '../../../config', '**/!(*.d).{ts,js}'),
    ),
  ],
  exports: [CloudinaryService],
  providers: [CloudinaryService, CloudinaryResolver],
})
export class CloudinaryModule {}
