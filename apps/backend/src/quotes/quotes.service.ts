import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { AdjustItemPriceDto } from './dto/adjust-item-price.dto.js';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto.js';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto.js';
import { renderQuoteHtml } from './templates/quote.template.js';
import { renderConfirmationHtml } from './templates/confirmation.template.js';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  async createQuote(dto: CreateQuoteRequestDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const found = products.map((p) => p.id);
      const missing = productIds.find((id) => !found.includes(id));
      throw new NotFoundException(`Product ${missing} not found`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const taxRate = 7;

    let autoTotal = 0;
    const itemsData = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const price = Number(product.unitPrice);
      autoTotal += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: price,
      };
    });

    const taxAmount = autoTotal * (taxRate / 100);
    const finalTotal = autoTotal + taxAmount;

    const quote = await this.prisma.$transaction(async (tx) => {
      return tx.quoteRequest.create({
        data: {
          customerName: dto.customerName,
          company: dto.company,
          email: dto.email,
          phone: dto.phone,
          message: dto.message,
          autoTotal,
          taxRate,
          discountAmount: 0,
          finalTotal,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });
    });

    // Generate confirmation PDF in background — ไม่ await เพื่อไม่ให้ user รอนาน
    this.generateConfirmationPdf(quote).catch(() => {});

    return quote;
  }

  findAll() {
    return this.prisma.quoteRequest.findMany({
      include: { items: { include: { product: true } }, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        assignedTo: true,
        quoteDocuments: true,
      },
    });
    if (!quote) throw new NotFoundException(`QuoteRequest ${id} not found`);
    return quote;
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    await this.findOne(id);
    return this.prisma.quoteRequest.update({
      where: { id },
      data: { status: dto.status, assignedToId: dto.assignedToId },
    });
  }

  async adjustItemPrice(quoteId: string, itemId: string, dto: AdjustItemPriceDto) {
    const quote = await this.findOne(quoteId);

    const item = quote.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);

    await this.prisma.quoteRequestItem.update({
      where: { id: itemId },
      data: { adjustedUnitPrice: dto.adjustedUnitPrice },
    });

    const updatedItems = quote.items.map((i) =>
      i.id === itemId ? { ...i, adjustedUnitPrice: dto.adjustedUnitPrice } : i,
    );

    const subtotal = updatedItems.reduce((sum, i) => {
      const price = Number(i.adjustedUnitPrice ?? i.unitPriceSnapshot);
      return sum + price * i.quantity;
    }, 0);

    const taxRate = Number(quote.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const finalTotal = subtotal + taxAmount - Number(quote.discountAmount);

    return this.prisma.quoteRequest.update({
      where: { id: quoteId },
      data: { finalTotal, status: 'ADJUSTED' },
      include: { items: true },
    });
  }

  private async generateConfirmationPdf(quote: {
    id: string;
    createdAt: Date;
    customerName: string;
    company: string | null;
    email: string;
    phone: string;
    message: string | null;
    autoTotal: unknown;
    taxRate: unknown;
    items: { productId: string; unitPriceSnapshot: unknown; quantity: number; product?: { name: string; unit: string } | null }[];
  }) {
    const subtotal = Number(quote.autoTotal);
    const taxRate = Number(quote.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const estimatedTotal = subtotal + taxAmount;

    const html = renderConfirmationHtml({
      refNumber: quote.id.slice(0, 8).toUpperCase(),
      submittedAt: quote.createdAt,
      customerName: quote.customerName,
      company: quote.company,
      email: quote.email,
      phone: quote.phone,
      message: quote.message,
      items: quote.items.map((item) => {
        const unitPrice = Number(item.unitPriceSnapshot);
        return {
          name: item.product?.name ?? item.productId,
          unit: item.product?.unit ?? '',
          quantity: item.quantity,
          unitPrice,
          total: unitPrice * item.quantity,
        };
      }),
      subtotal,
      taxRate,
      taxAmount,
      estimatedTotal,
    });

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = Buffer.from(
        await page.pdf({ format: 'A4', printBackground: true }),
      );
      await this.uploads.uploadBuffer(
        `confirmations/${quote.id}.pdf`,
        pdfBuffer,
        'application/pdf',
      );
    } finally {
      await browser.close();
    }
  }

  async removeDocument(quoteId: string, documentId: string) {
    const doc = await this.prisma.quoteDocument.findFirst({
      where: { id: documentId, quoteRequestId: quoteId },
    });
    if (!doc) throw new NotFoundException(`QuoteDocument ${documentId} not found`);
    if (doc.pdfKey) {
      await this.uploads.deleteFile(doc.pdfKey).catch(() => {});
    }
    return this.prisma.quoteDocument.delete({ where: { id: documentId } });
  }

  async remove(id: string) {
    const quote = await this.findOne(id);
    await Promise.allSettled(
      quote.quoteDocuments
        .filter((doc) => doc.pdfKey)
        .map((doc) => this.uploads.deleteFile(doc.pdfKey!)),
    );
    await this.prisma.$transaction([
      this.prisma.quoteDocument.deleteMany({ where: { quoteRequestId: id } }),
      this.prisma.quoteRequestItem.deleteMany({ where: { quoteRequestId: id } }),
      this.prisma.quoteRequest.delete({ where: { id } }),
    ]);
  }

  async generateDocument(quoteId: string) {
    const quote = await this.findOne(quoteId);

    const dateStr = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const documentNumber = `QT-${dateStr}-${seq}`;

    const subtotal = Number(quote.autoTotal);
    const taxRate = Number(quote.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = Number(quote.discountAmount);
    const grandTotal = Number(quote.finalTotal);

    const html = renderQuoteHtml({
      documentNumber,
      issuedAt: new Date(),
      customerName: quote.customerName,
      company: quote.company,
      email: quote.email,
      phone: quote.phone,
      items: quote.items.map((item) => {
        const unitPrice = Number(
          item.adjustedUnitPrice ?? item.unitPriceSnapshot,
        );
        return {
          name: item.product.name,
          unit: item.product.unit,
          quantity: item.quantity,
          unitPrice,
          total: unitPrice * item.quantity,
        };
      }),
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      grandTotal,
    });

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      pdfBuffer = Buffer.from(await page.pdf({ format: 'A4', printBackground: true }));
    } finally {
      await browser.close();
    }

    const pdfKey = `quotes/${quoteId}/${documentNumber}.pdf`;
    await this.uploads.uploadBuffer(pdfKey, pdfBuffer, 'application/pdf');

    const doc = await this.prisma.$transaction(async (tx) => {
      const document = await tx.quoteDocument.create({
        data: {
          quoteRequestId: quoteId,
          documentNumber,
          subtotal,
          taxAmount,
          discountAmount,
          grandTotal,
          pdfKey,
        },
      });
      await tx.quoteRequest.update({
        where: { id: quoteId },
        data: { status: 'QUOTED' },
      });
      return document;
    });

    return doc;
  }
}
