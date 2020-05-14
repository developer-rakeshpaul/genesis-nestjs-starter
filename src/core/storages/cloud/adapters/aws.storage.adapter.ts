import AwsS3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import multer from 'multer';
import AwsStorage from 'multer-s3';
import path from 'path';
import config from '../../../../config/storage';
import { StorageAbstract } from '../storage.abstract';

export class AwsStorageAdapter extends StorageAbstract {
  private readonly storage;
  private readonly storageForCropping;

  private readonly AWS_CONFIG = {
    s3: new AwsS3({
      credentials: {
        accessKeyId: config.AWS_STORAGE.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_STORAGE.AWS_SECRET_ACCESS_KEY,
      },
      s3ForcePathStyle: config.AWS_STORAGE.AWS_S3_FORCE_PATH_STYLE,
      s3BucketEndpoint: config.AWS_STORAGE.AWS_S3_BUCKET_ENDPOINT,
      endpoint: config.AWS_STORAGE.AWS_ENDPOINT,
    }),
    acl: config.AWS_STORAGE.AWS_ACL,
    bucket: config.AWS_STORAGE.AWS_BUCKET,
  };

  constructor(options: multer.Options | undefined) {
    super();

    this.setMulter(
      multer({
        ...options,
        storage: this,
      }).single('file'),
    );

    this.storage = new AwsStorage({
      ...this.AWS_CONFIG,
    });

    this.storageForCropping = AwsStorage({
      ...this.AWS_CONFIG,
    });
  }

  async _handleFile(req, file, cb) {
    const filePath = await this.saveAsTemp(file);

    await this.resize(filePath).then((resizedFile) => {
      this.storageForCropping.getKey = (inReq, inFile, inCb) => {
        inCb(
          null,
          this.croppedPrefix +
            this.filename +
            path.extname(inFile.originalname),
        );
      };

      this.storageForCropping.getContentType = (inReq, inFile, inCb) => {
        inCb(null, inFile.mimetype);
      };

      this.storageForCropping.getMetadata = (inReq, inFile, inCb) => {
        inCb(null, { fieldName: inFile.fieldname });
      };

      this.storageForCropping._handleFile(
        req,
        {
          ...file,
          stream: fs.createReadStream(resizedFile as string),
        },
        (err) => {
          if (err) {
            Promise.reject(err);
          }
          Promise.resolve(true);
        },
      );
    });

    const storage: any = await new Promise((resolve) => {
      this.storage.getKey = (inReq, inFile, inCb) => {
        inCb(null, this.filename + path.extname(inFile.originalname));
      };

      this.storage.getContentType = (inReq, inFile, inCb) => {
        inCb(null, inFile.mimetype);
      };

      this.storage.getMetadata = (inReq, inFile, inCb) => {
        inCb(null, { fieldName: inFile.fieldname });
      };

      this.storage._handleFile(
        req,
        {
          ...file,
          stream: fs.createReadStream(filePath as string),
        },
        (err, destination) => {
          resolve(() => cb(err, destination));
        },
      );
    });

    this.reset();

    storage();
  }

  async _removeFile() {
    this.reset();
  }
}
