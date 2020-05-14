/* eslint-disable @typescript-eslint/camelcase */
import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { Roles } from './../../../core/decorators/roles.decorator';
import { RolesGuard } from './../auth/guards/role.guard';
import { CloudinaryService } from './cloudinary.service';
import Resource from './type/resource.type';

@Resolver('Cloudinary')
export class CloudinaryResolver {
  constructor(private readonly service: CloudinaryService) {}

  @Query(() => Resource)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async resources() {
    const result: any = await this.service.resources();
    return result;
  }
}
