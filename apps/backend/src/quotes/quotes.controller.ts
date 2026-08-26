import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AdjustItemPriceDto } from './dto/adjust-item-price.dto.js';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto.js';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto.js';
import { QuotesService } from './quotes.service.js';

@Controller('quotes')
export class QuotesController {
  constructor(private quotes: QuotesService) {}

  @Post()
  create(@Body() dto: CreateQuoteRequestDto) {
    return this.quotes.createQuote(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SALES')
  findAll() {
    return this.quotes.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SALES')
  findOne(@Param('id') id: string) {
    return this.quotes.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SALES')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotes.updateStatus(id, dto);
  }

  @Patch(':id/items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adjustItemPrice(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: AdjustItemPriceDto,
  ) {
    return this.quotes.adjustItemPrice(id, itemId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.quotes.remove(id);
  }

  @Post(':id/document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  generateDocument(@Param('id') id: string) {
    return this.quotes.generateDocument(id);
  }

  @Delete(':id/document/:documentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.quotes.removeDocument(id, documentId);
  }
}
