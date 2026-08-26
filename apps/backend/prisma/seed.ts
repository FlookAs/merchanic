import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Categories
  const catWater = await prisma.category.upsert({
    where: { slug: 'water-treatment' },
    update: {},
    create: { name: 'ระบบบำบัดน้ำ', slug: 'water-treatment', description: 'ออกแบบ ติดตั้ง และซ่อมบำรุงระบบบำบัดน้ำอุตสาหกรรมครบวงจร', icon: 'Droplets' },
  });
  const catLeak = await prisma.category.upsert({
    where: { slug: 'leak-repair' },
    update: {},
    create: { name: 'ซ่อมรอยรั่ว', slug: 'leak-repair', description: 'ตรวจสอบและซ่อมแซมรอยรั่วในระบบท่อและอุปกรณ์อุตสาหกรรม', icon: 'Shield' },
  });
  const catWeld = await prisma.category.upsert({
    where: { slug: 'welding' },
    update: {},
    create: { name: 'งานเชื่อมและซ่อมเครื่องจักร', slug: 'welding', description: 'รับงานเชื่อมโลหะและซ่อมบำรุงเครื่องจักรอุตสาหกรรมทุกประเภท', icon: 'Wrench' },
  });

  // Products — ใช้ UUID คงที่เพื่อให้ upsert ทำงานได้
  const p1 = await prisma.product.upsert({
    where: { id: '11111111-1111-1111-1111-111111111001' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111001',
      categoryId: catWater.id,
      name: 'ระบบกรองน้ำอุตสาหกรรม (RO)',
      description: 'ระบบกรองน้ำแบบ Reverse Osmosis สำหรับโรงงานอุตสาหกรรม',
      unitPrice: 85000,
      unit: 'ชุด',
      isPublished: true,
    },
  });
  const p2 = await prisma.product.upsert({
    where: { id: '11111111-1111-1111-1111-111111111002' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111002',
      categoryId: catWater.id,
      name: 'บำรุงรักษาระบบบำบัดน้ำรายปี',
      description: 'บริการตรวจสอบและบำรุงรักษาระบบบำบัดน้ำประจำปี',
      unitPrice: 12000,
      unit: 'ครั้ง',
      isPublished: true,
    },
  });
  const p3 = await prisma.product.upsert({
    where: { id: '11111111-1111-1111-1111-111111111003' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111003',
      categoryId: catLeak.id,
      name: 'ซ่อมรอยรั่วท่อแรงดันสูง',
      description: 'บริการซ่อมรอยรั่วท่อแรงดันสูงโดยไม่ต้องหยุดการผลิต',
      unitPrice: 25000,
      unit: 'จุด',
      isPublished: true,
    },
  });
  const p4 = await prisma.product.upsert({
    where: { id: '11111111-1111-1111-1111-111111111004' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111004',
      categoryId: catWeld.id,
      name: 'งานเชื่อมซ่อมเครื่องจักร',
      description: 'บริการเชื่อมซ่อมชิ้นส่วนเครื่องจักรด้วยช่างเชื่อมมืออาชีพ',
      unitPrice: 3500,
      unit: 'ชั่วโมง',
      isPublished: true,
    },
  });

  // Portfolios
  await prisma.portfolio.upsert({
    where: { id: '22222222-2222-2222-2222-222222222001' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222001',
      title: 'ติดตั้งระบบบำบัดน้ำโรงงานอาหาร จ.สมุทรปราการ',
      description: 'ติดตั้งระบบ RO ขนาด 50 ลูกบาศก์เมตร/วัน สำหรับโรงงานผลิตอาหารแช่แข็ง',
      relatedServiceId: catWater.id,
    },
  });
  await prisma.portfolio.upsert({
    where: { id: '22222222-2222-2222-2222-222222222002' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222002',
      title: 'ซ่อมรอยรั่วหม้อต้มไอน้ำ โรงงานยาง จ.ระยอง',
      description: 'แก้ปัญหารอยรั่วหม้อต้มความดัน 15 บาร์ โดยไม่หยุดสายการผลิต',
      relatedServiceId: catLeak.id,
    },
  });

  // Staff users
  const adminHash = await bcrypt.hash('admin1234', 10);
  const salesHash = await bcrypt.hash('sales1234', 10);

  const admin = await prisma.staffUser.upsert({
    where: { email: 'admin@merchanic.co' },
    update: {},
    create: {
      email: 'admin@merchanic.co',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  await prisma.staffUser.upsert({
    where: { email: 'sales@merchanic.co' },
    update: {},
    create: {
      email: 'sales@merchanic.co',
      passwordHash: salesHash,
      role: 'SALES',
    },
  });

  // Sample QuoteRequest
  const autoTotal = p1.unitPrice.toNumber() * 1 + p3.unitPrice.toNumber() * 2;
  const taxAmount = autoTotal * 0.07;
  const finalTotal = autoTotal + taxAmount;

  const quote = await prisma.quoteRequest.upsert({
    where: { id: '33333333-3333-3333-3333-333333333001' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333001',
      customerName: 'สมชาย มั่นคง',
      company: 'บริษัท อุตสาหกรรมไทย จำกัด',
      email: 'somchai@thai-industry.co.th',
      phone: '0812345678',
      message: 'ต้องการติดตั้งระบบบำบัดน้ำและซ่อมรอยรั่วในโรงงาน',
      status: 'NEW',
      assignedToId: admin.id,
      autoTotal: autoTotal,
      taxRate: 7.0,
      discountAmount: 0,
      finalTotal: finalTotal,
    },
  });

  await prisma.quoteRequestItem.upsert({
    where: { id: '44444444-4444-4444-4444-444444444001' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444001',
      quoteRequestId: quote.id,
      productId: p1.id,
      quantity: 1,
      unitPriceSnapshot: p1.unitPrice,
    },
  });
  await prisma.quoteRequestItem.upsert({
    where: { id: '44444444-4444-4444-4444-444444444002' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444002',
      quoteRequestId: quote.id,
      productId: p3.id,
      quantity: 2,
      unitPriceSnapshot: p3.unitPrice,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
