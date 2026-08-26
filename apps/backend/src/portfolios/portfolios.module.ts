import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { PortfoliosController } from './portfolios.controller.js';
import { PortfoliosService } from './portfolios.service.js';

@Module({
  imports: [AuthModule, UploadsModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
})
export class PortfoliosModule {}
