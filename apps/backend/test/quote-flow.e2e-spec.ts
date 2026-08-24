import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

// E2E ทั้งหมดทำผ่าน HTTP — ไม่ import PrismaService โดยตรง
// เพราะ Prisma 7 generated client ใช้ ESM (import.meta) ซึ่ง Jest CJS รันตรงๆ ไม่ได้
describe('Quote Flow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let productId: string;
  let categoryId: string;
  let quoteId: string;
  let itemId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login — admin ได้ token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@merchanic.co', password: 'admin1234' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    adminToken = res.body.access_token;
  });

  it('GET /categories — ดึง categoryId จาก seed', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    categoryId = res.body[0].id;
  });

  it('POST /products — admin สร้าง product สำหรับ test', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        name: 'E2E Test Product',
        description: 'product for e2e',
        unitPrice: 10000,
        unit: 'ชิ้น',
        isPublished: true,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    productId = res.body.id;
  });

  it('POST /quotes — ลูกค้าส่งคำขอ (public)', async () => {
    const res = await request(app.getHttpServer())
      .post('/quotes')
      .send({
        customerName: 'สมชาย ทดสอบ',
        email: 'customer@test.com',
        phone: '0812345678',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(Number(res.body.autoTotal)).toBe(20000);
    expect(Number(res.body.finalTotal)).toBeCloseTo(21400, 0);
    quoteId = res.body.id;
    itemId = res.body.items[0].id;
  });

  it('GET /quotes — public ไม่ได้ (401)', async () => {
    await request(app.getHttpServer()).get('/quotes').expect(401);
  });

  it('GET /quotes/:id — admin ดู quote พร้อม items', async () => {
    const res = await request(app.getHttpServer())
      .get(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('PATCH /quotes/:id/items/:itemId — admin ปรับราคา', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}/items/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adjustedUnitPrice: 8000 })
      .expect(200);

    expect(res.body.status).toBe('ADJUSTED');
    // 8000 × 2 = 16000, +7% VAT = 17120
    expect(Number(res.body.finalTotal)).toBeCloseTo(17120, 0);
  });

  it('POST /quotes/:id/document — admin generate PDF', async () => {
    const res = await request(app.getHttpServer())
      .post(`/quotes/${quoteId}/document`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.documentNumber).toMatch(/^QT-\d{8}-\d{4}$/);
    expect(res.body.pdfKey).toContain(quoteId);
  });

  it('DELETE /quotes/:id — cleanup quote', async () => {
    await request(app.getHttpServer())
      .delete(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('DELETE /products/:id — cleanup product', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
