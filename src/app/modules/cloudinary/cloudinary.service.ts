import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CloudinaryDeleteResponse } from '../../../core/types/cloudinary.delete.response.model';
import isEqual from 'lodash.isequal';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    v2.config(configService.get('cloudinary'));
  }

  async resources() {
    try {
      const result = await v2.api.resources();
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteResources(publicIds: Array<string>) {
    try {
      const result: CloudinaryDeleteResponse = await v2.api.delete_resources(
        publicIds,
      );
      const deletedIds = Object.keys(result.deleted).filter(
        (key: string) => result.deleted[key] === 'deleted',
      );
      return isEqual(deletedIds, publicIds);
    } catch (error) {
      // TODO - add support for logging cloudinary errors
      // error: {
      //   message: 'Missing required parameter - public_ids',
      //   http_code: 400
      // }
      console.log(error);
      return false;
    }
  }
}
