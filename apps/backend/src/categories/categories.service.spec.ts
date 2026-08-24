import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoriesService } from './categories.service.js';

const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(CategoriesService);
    jest.clearAllMocks();
  });

  it('findAll returns array', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('findOne returns category when found', async () => {
    const cat = { id: '1', name: 'Test', slug: 'test' };
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    expect(await service.findOne('1')).toEqual(cat);
  });

  it('create returns created category', async () => {
    const dto = { name: 'New', slug: 'new' };
    mockPrisma.category.create.mockResolvedValue({ id: '2', ...dto });
    expect(await service.create(dto)).toMatchObject(dto);
  });
});
