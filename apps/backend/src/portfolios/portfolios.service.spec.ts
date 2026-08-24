import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { PortfoliosService } from './portfolios.service.js';

const mockPrisma = {
  portfolio: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PortfoliosService', () => {
  let service: PortfoliosService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PortfoliosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(PortfoliosService);
    jest.clearAllMocks();
  });

  it('findAll returns array', async () => {
    mockPrisma.portfolio.findMany.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.portfolio.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('create returns created portfolio', async () => {
    const dto = { title: 'งาน', description: 'รายละเอียด' };
    mockPrisma.portfolio.create.mockResolvedValue({ id: '1', ...dto });
    expect(await service.create(dto)).toMatchObject(dto);
  });
});
