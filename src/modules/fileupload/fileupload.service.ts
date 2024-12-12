import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

import 'dotenv/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as path from 'path';

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

  async uploadSingleFile(
    image: Express.Multer.File,
    p0: boolean,
    {
      file,
    }: {
      file: Express.Multer.File;
      isPublic: boolean;
    },
  ) {
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

  async compressVideo(
    inputPath: string,
    outputPath: string,
  ): Promise<Express.Multer.File> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Compressing video:', inputPath);
        console.log('Output path:', outputPath);
        // Validate input paths
        if (!fs.existsSync(inputPath)) {
          return reject(new Error(`Input file does not exist: ${inputPath}`));
        }

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        ffmpeg(inputPath)
          .outputOptions('-vf', 'scale=-2:720')
          .size('50%')
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('Spawned FFmpeg with command: ' + commandLine);
          })
          .on('end', () => {
            console.log(`Video successfully compressed: ${outputPath}`);

            // Verify the output file was created
            if (!fs.existsSync(outputPath)) {
              return reject(
                new Error(`Compressed video not found at: ${outputPath}`),
              );
            }

            const compressedFileBuffer = fs.readFileSync(outputPath);

            const file: Express.Multer.File = {
              fieldname: '',
              originalname: path.basename(outputPath),
              encoding: '',
              mimetype: 'video/mp4',
              size: compressedFileBuffer.length,
              buffer: compressedFileBuffer,
              stream: fs.createReadStream(outputPath),
              destination: '',
              filename: path.basename(outputPath),
              path: outputPath,
            };

            resolve(file);
          })
          .on('error', (err) => {
            console.error('Error compressing video:', err);
            reject(new Error(`Video compression failed: ${err.message}`));
          })
          .save(outputPath);
      } catch (e) {
        console.error('Unexpected error in video compression:', e);
        reject(new Error(`Unexpected compression error: ${e.message}`));
      }
    });
  }
}
