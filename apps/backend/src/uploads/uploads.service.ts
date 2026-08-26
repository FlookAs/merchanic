import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    if (!accountId) throw new Error('R2_ACCOUNT_ID is not set');

    this.bucket = process.env.R2_BUCKET_NAME ?? 'merchanic';
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async uploadFile(folder: string, file: Express.Multer.File): Promise<string> {
    const key = `${folder}/${randomUUID()}${extname(file.originalname)}`;
    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });
      await upload.done();
      return key;
    } catch {
      throw new InternalServerErrorException('อัปโหลดไฟล์ไม่สำเร็จ');
    }
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        },
      });
      await upload.done();
      return key;
    } catch {
      throw new InternalServerErrorException('อัปโหลดไฟล์ไม่สำเร็จ');
    }
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
