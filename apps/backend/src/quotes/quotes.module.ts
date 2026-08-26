import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { QuotesController } from './quotes.controller.js';
import { QuotesService } from './quotes.service.js';

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
