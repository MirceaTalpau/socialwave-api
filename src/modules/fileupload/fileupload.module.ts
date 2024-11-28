import { Module } from '@nestjs/common';
import { FileUploadService } from './fileupload.service';

@Module({
  providers: [FileUploadService],
  controllers: [],
  exports: [FileUploadService],
})
export class FileuploadModule {}
