import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './products.service.js';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(ProductsService);
    jest.clearAllMocks();
  });

  it('findAll (public) filters by isPublished', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublished: true } }),
    );
  });

  it('findAll (admin) returns all products', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    await service.findAll(true);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('create returns created product', async () => {
    const dto = {
      categoryId: 'cat-1',
      name: 'Product',
      description: 'Desc',
      unitPrice: 1000,
      unit: 'ชิ้น',
    };
    mockPrisma.product.create.mockResolvedValue({ id: '1', ...dto });
    expect(await service.create(dto)).toMatchObject(dto);
  });
});
