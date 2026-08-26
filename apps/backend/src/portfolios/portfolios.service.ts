import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { CreatePortfolioDto } from './dto/create-portfolio.dto.js';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto.js';

@Injectable()
export class PortfoliosService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  findAll() {
    return this.prisma.portfolio.findMany({
      include: { relatedService: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
      include: { relatedService: true },
    });
    if (!portfolio) throw new NotFoundException(`Portfolio ${id} not found`);
    return portfolio;
  }

  create(dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({ data: dto });
  }

  async update(id: string, dto: UpdatePortfolioDto) {
    const existing = await this.findOne(id);
    if (dto.imageKeys) {
      const removed = existing.imageKeys.filter((k) => !dto.imageKeys!.includes(k));
      await Promise.allSettled(removed.map((k) => this.uploads.deleteFile(k)));
    }
    return this.prisma.portfolio.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const portfolio = await this.findOne(id);
    await Promise.allSettled(
      portfolio.imageKeys.map((key) => this.uploads.deleteFile(key)),
    );
    return this.prisma.portfolio.delete({ where: { id } });
  }
}
