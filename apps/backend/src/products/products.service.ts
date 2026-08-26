import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  findAll(adminView = false) {
    return this.prisma.product.findMany({
      where: adminView ? undefined : { isPublished: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);
    if (dto.imageKeys) {
      const removed = existing.imageKeys.filter((k) => !dto.imageKeys!.includes(k));
      await Promise.allSettled(removed.map((k) => this.uploads.deleteFile(k)));
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await Promise.allSettled(
      product.imageKeys.map((key) => this.uploads.deleteFile(key)),
    );
    return this.prisma.product.delete({ where: { id } });
  }
}
