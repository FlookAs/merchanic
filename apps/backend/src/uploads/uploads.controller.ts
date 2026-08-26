import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UploadsService } from './uploads.service.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new BadRequestException('รองรับเฉพาะไฟล์ JPG, PNG, WebP'), false);
  }
  cb(null, true);
};

const interceptorOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('files', 20, interceptorOptions))
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('ไม่พบไฟล์');
    const imageKeys = await Promise.all(
      files.map((f) => this.uploadsService.uploadFile('products', f)),
    );
    return { imageKeys };
  }

  @Post('portfolios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('files', 20, interceptorOptions))
  async uploadPortfolioImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('ไม่พบไฟล์');
    const imageKeys = await Promise.all(
      files.map((f) => this.uploadsService.uploadFile('portfolios', f)),
    );
    return { imageKeys };
  }
}
