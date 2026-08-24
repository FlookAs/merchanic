import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { QuotesService } from './quotes.service.js';

const mockProduct = {
  id: 'prod-1',
  name: 'ระบบ RO',
  unit: 'ชุด',
  unitPrice: 85000,
  description: '',
  categoryId: 'cat-1',
  imageKey: null,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  product: { findMany: jest.fn() },
  quoteRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  quoteRequestItem: { update: jest.fn() },
  quoteDocument: { create: jest.fn() },
  $transaction: jest.fn(),
};

describe('QuotesService', () => {
  let service: QuotesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(QuotesService);
    jest.clearAllMocks();
  });

  describe('createQuote', () => {
    it('คำนวณ autoTotal และ finalTotal ถูกต้อง', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockPrisma));
      mockPrisma.quoteRequest.create.mockResolvedValue({
        id: 'q-1',
        autoTotal: 85000,
        finalTotal: 90950,
        items: [],
      });

      const result = await service.createQuote({
        customerName: 'สมชาย',
        email: 'test@test.com',
        phone: '0812345678',
        items: [{ productId: 'prod-1', quantity: 1 }],
      });

      expect(mockPrisma.quoteRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            autoTotal: 85000,
            taxRate: 7,
            finalTotal: 85000 * 1.07,
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('throw NotFoundException ถ้า product ไม่เจอ', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      await expect(
        service.createQuote({
          customerName: 'ทดสอบ',
          email: 'x@x.com',
          phone: '0800000000',
          items: [{ productId: 'not-exist', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustItemPrice', () => {
    it('คำนวณ finalTotal ใหม่หลังปรับราคา', async () => {
      const mockQuote = {
        id: 'q-1',
        taxRate: 7,
        discountAmount: 0,
        autoTotal: 85000,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 1,
            unitPriceSnapshot: 85000,
            adjustedUnitPrice: null,
            product: mockProduct,
          },
        ],
        assignedTo: null,
        quoteDocuments: [],
      };

      mockPrisma.quoteRequest.findUnique.mockResolvedValue(mockQuote);
      mockPrisma.quoteRequestItem.update.mockResolvedValue({});
      mockPrisma.quoteRequest.update.mockResolvedValue({
        ...mockQuote,
        finalTotal: 80000 * 1.07,
        status: 'ADJUSTED',
      });

      const result = await service.adjustItemPrice('q-1', 'item-1', {
        adjustedUnitPrice: 80000,
      });

      expect(mockPrisma.quoteRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            finalTotal: 80000 * 1.07,
            status: 'ADJUSTED',
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('throw NotFoundException ถ้า item ไม่เจอ', async () => {
      mockPrisma.quoteRequest.findUnique.mockResolvedValue({
        id: 'q-1',
        taxRate: 7,
        discountAmount: 0,
        autoTotal: 0,
        items: [],
        assignedTo: null,
        quoteDocuments: [],
      });

      await expect(
        service.adjustItemPrice('q-1', 'bad-item', { adjustedUnitPrice: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
