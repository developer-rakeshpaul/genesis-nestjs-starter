import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryResolver } from './cloudinary.resolver';
import { CloudinaryService } from './cloudinary.service';

@Module({
  exports: [CloudinaryService],
  providers: [CloudinaryService, ConfigService, CloudinaryResolver],
})
export class CloudinaryModule {}
