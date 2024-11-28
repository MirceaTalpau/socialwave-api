import { Injectable, InternalServerErrorException } from '@nestjs/common';

import 'dotenv/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FileUploadService {
  private client: S3Client;
  private bucketName = process.env.AWS_BUCKET_NAME;
  private region = process.env.AWS_REGION;
  constructor() {
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET,
      },
      forcePathStyle: true,
    });
  }

  async uploadSingleFile({
    file,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
  }) {
    try {
      const key = `${Date.now().toString()}-${file.originalname}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        Metadata: {
          originalName: file.originalname,
        },
      });

      const response = await this.client.send(command);
      console.log('response', response);
      return {
        key,
        url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async uploadMultipleFiles({
    files,
  }: {
    files: Express.Multer.File[];
    isPublic: boolean;
  }) {
    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const key = `${Date.now().toString()}-${file.originalname}`;
          const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            Metadata: {
              originalName: file.originalname,
            },
          });

          const response = await this.client.send(command);

          console.log('response', response);
          return {
            key,
            url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
          };
        }),
      );

      return uploadedFiles;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
