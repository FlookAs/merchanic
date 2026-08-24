# Merchanic — Project Blueprint

Redesign เว็บไซต์ merchanic.co (บริการวิศวกรรม/ซ่อมบำรุงอุตสาหกรรม: ระบบบำบัดน้ำ, ซ่อมรอยรั่ว, ตรวจสอบอุปกรณ์, งานเชื่อม/ซ่อมเครื่องจักร) จากเว็บ WordPress แบบข้อมูลอย่างเดียว ให้เป็นระบบที่มีหลังบ้านเต็มรูปแบบ: จัดการเนื้อหาเอง, รับคำขอใบเสนอราคาแบบคำนวณราคาอัตโนมัติ, และให้ทีมขายปรับราคา/ออกใบเสนอราคาจริงผ่าน dashboard

อัปเดตล่าสุด: 2026-08-24

---

## 1. Stack

| ชั้นระบบ | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| หน้าบ้าน (public) | React | ยืนยันแล้ว |
| หลังบ้าน / API | NestJS (Node.js + TypeScript) | build เป็น Docker image ตั้งแต่แรก เพื่อรันบน free tier วันนี้ และย้ายขึ้น VPS ได้ทันทีในอนาคตโดยไม่แก้โค้ด |
| ORM | Prisma | type-safe คู่กับ TypeScript |
| Auth | JWT + bcrypt | เฉพาะฝั่งพนักงาน (admin/sales) — เว็บสาธารณะไม่ต้องล็อกอิน |
| เอกสาร PDF | Puppeteer | render เทมเพลต HTML → PDF ใบเสนอราคา |
| เก็บไฟล์ | Cloudflare R2 (S3-compatible) | รูปสินค้า/ผลงาน/PDF แยกจากฐานข้อมูล, ไม่คิด egress |

**ไม่มีระบบสมาชิกฝั่งลูกค้า** — มีเฉพาะ user ฝั่งพนักงาน 2 role: `admin` (จัดการเนื้อหา + ปรับราคา + สิทธิ์ผู้ใช้งาน) และ `sales` (ดู/ปรับราคา/ออกใบเสนอราคาเฉพาะ QuoteRequest)

---

## 2. Database — Neon (Postgres, free tier)

เลือก **Neon** เป็นหลัก เพราะ compute ไม่ pause อัตโนมัติ (ต่างจาก Supabase ที่ pause หลังไม่ใช้งาน 7 วัน) เหมาะกับระบบที่ต้องรับคำขอใบเสนอราคาแบบ real-time ตลอดเวลา

- Storage: 0.5 GB/โปรเจกต์ — เพียงพอ เพราะข้อมูลเป็น text/number ล้วน (รูป/PDF อยู่ที่ R2)
- Compute: 100 CU-hours/เดือน

---

## 3. Schema

### Category
| field | type | note |
|---|---|---|
| id | uuid | PK |
| name | string | |
| slug | string | ใช้ทำ URL |

### Product
| field | type | note |
|---|---|---|
| id | uuid | PK |
| category_id | fk | → Category |
| name | string | |
| description | text | |
| unit_price | decimal | ราคาตั้งต้น ใช้คำนวณอัตโนมัติ |
| unit | string | เช่น ชิ้น, ชุด |
| image_key | string | อ้างอิงไฟล์บน R2 |
| is_published | bool | |

### Portfolio (ผลงาน/เคส)
| field | type | note |
|---|---|---|
| id | uuid | PK |
| title | string | |
| description | text | |
| image_key | string | อ้างอิงไฟล์บน R2 |
| related_service | fk? | → Category (optional) |

### StaffUser
| field | type | note |
|---|---|---|
| id | uuid | PK |
| email | string | unique, ใช้ล็อกอิน |
| password_hash | string | bcrypt |
| role | enum | `admin` / `sales` |

### QuoteRequest
| field | type | note |
|---|---|---|
| id | uuid | PK |
| customer_name / company / email / phone | string | |
| message | text | ข้อความเพิ่มเติมจากลูกค้า |
| status | enum | ใหม่ / กำลังตรวจสอบ / ปรับราคาแล้ว / ออกใบเสนอราคาแล้ว / ปิดงาน |
| assigned_to | fk | → StaffUser |
| auto_total | decimal | ยอดรวมสินค้าที่ระบบคำนวณอัตโนมัติ (ก่อนภาษี/ส่วนลด) |
| tax_rate | decimal | ค่าเริ่มต้น 7% (VAT) |
| discount_amount | decimal | ส่วนลดท้ายบิล — admin ใส่ตอนรีวิว ค่าเริ่มต้น 0 |
| final_total | decimal | (auto_total หรือยอดหลังปรับราคารายชิ้น) + VAT − ส่วนลด |

### QuoteRequestItem
| field | type | note |
|---|---|---|
| id | uuid | PK |
| quote_request_id | fk | → QuoteRequest |
| product_id | fk | → Product |
| quantity | int | |
| unit_price_snapshot | decimal | ราคา ณ ตอนลูกค้าเลือก — ไม่เปลี่ยนตามราคาปัจจุบันของ Product |
| adjusted_unit_price | decimal? | null จนกว่า admin จะปรับ |

### QuoteDocument (ใบเสนอราคาฉบับจริง / PDF)
| field | type | note |
|---|---|---|
| id | uuid | PK |
| quote_request_id | fk | → QuoteRequest |
| document_number | string | เลขที่ใบเสนอราคา |
| subtotal / tax_amount / discount_amount / grand_total | decimal | snapshot ยอดเงินทุกบรรทัด ณ วันที่ออกเอกสาร |
| pdf_key | string | อ้างอิงไฟล์ PDF บน R2 |
| issued_at | datetime | |

> **สำคัญ:** แยก `unit_price_snapshot` ออกจากราคาปัจจุบันใน Product เสมอ — ไม่งั้นการเปลี่ยนราคาสินค้าในอนาคตจะย้อนไปเปลี่ยนยอดของคำขอเก่าที่ลูกค้าเคยเห็นไปแล้ว

---

## 4. Hosting — free tier

| ชั้นระบบ | ผู้ให้บริการ | ข้อจำกัดสำคัญ |
|---|---|---|
| หน้าบ้าน (static build) | Netlify Free | bandwidth 100GB/เดือน, ใช้เชิงพาณิชย์ได้ |
| API (NestJS) | Render Free Web Service | deploy จาก Dockerfile ตรงๆ — 750 ชม./เดือน, sleep หลังไม่มีคนเรียก 15 นาที (คำขอแรกหลังตื่นช้า ~1 นาที) |
| ฐานข้อมูล | Neon Free | ตามข้อ 2 |
| ไฟล์ (รูป/PDF) | Cloudflare R2 Free | 10GB storage + เขียน 1 ล้าน/อ่าน 10 ล้านครั้งต่อเดือน + ไม่คิด egress — ต้องผูกบัตรเครดิตตอนสมัคร แต่ไม่ถูกเรียกเก็บถ้าไม่เกินโควตา |

**ห้ามใช้ Vercel Hobby (ฟรี)** — เงื่อนไขห้ามใช้เชิงพาณิชย์ชัดเจน

**เส้นทางย้ายขึ้น VPS ในอนาคต** (ถ้าต้องการ, เช่น Hostinger KVM 2 / Hetzner CX21):
- Backend: `docker build` แล้วรัน image เดิมบน VPS ได้เลย ไม่ต้องแก้โค้ด
- Database: `pg_dump` จาก Neon → `pg_restore` เข้า Postgres container บน VPS (วางแผนช่วงปิดรับคำขอสั้นๆ)
- File storage: ไม่ต้องย้าย ใช้ R2 ต่อได้เลยไม่ว่า backend จะรันที่ไหน

---

## 5. Workflow ใบเสนอราคา

1. **ลูกค้าเลือกสินค้า** (public, ไม่ต้องล็อกอิน) — ใส่ตะกร้าเก็บใน browser
2. **ระบบคำนวณราคารวมอัตโนมัติ** + ลูกค้ากรอกข้อมูลติดต่อ
3. **สร้าง QuoteRequest + QuoteRequestItem** พร้อม snapshot ราคา → แจ้งเตือนทีมขาย
4. **Admin/Sales ตรวจสอบ** (ต้องล็อกอิน) — ปรับราคารายชิ้นได้ถ้าลูกค้าขอต่อราคา
5. **Generate PDF** (QuoteDocument) จากยอดสุดท้าย
6. **ส่งใบเสนอราคาให้ลูกค้า** → อัปเดตสถานะ → ปิดงาน (หรือย้อนกลับไปข้อ 4 ถ้าลูกค้าขอต่อราคาอีกรอบ)

---

## 6. ลำดับการพัฒนา

ลำดับที่ควรทำจริง (เรียงตามสิ่งที่ต้องเสร็จก่อนถึงจะเริ่มอย่างอื่นได้):

**Phase 0 — วางฐานโปรเจกต์**
- สร้าง repo, branch strategy: `main` (production) / `develop` / `feature/*` — merge ผ่าน PR review เท่านั้น
- Dockerfile + docker-compose สำหรับ local dev (NestJS + Postgres)
- แยก config local / staging / production — ห้าม commit secret
- ตั้ง CI (GitHub Actions): lint + test + build ทุก PR

**Phase 1 — Data layer**
- เขียน Prisma schema ตามข้อ 3 + migration แรก
- seed script ข้อมูลตัวอย่างสำหรับ dev

**Phase 2 — Backend core**
- Auth module (JWT + bcrypt + role guard) ก่อนเพื่อน — ทุก module อื่นต้องพึ่งสิทธิ์นี้
- CRUD พื้นฐาน: Category → Product → Portfolio พร้อม unit test คู่กันไปทันที

**Phase 3 — Quote engine** (ส่วนซับซ้อนที่สุด ทำและเทสให้จบก่อนต่อ frontend)
- endpoint สร้าง QuoteRequest + Items พร้อมคำนวณ auto_total (รวม VAT/ส่วนลด)
- endpoint ปรับราคารายชิ้น → คำนวณ final_total ใหม่
- generate PDF (Puppeteer) จาก QuoteDocument
- integration test ทั้ง flow ก่อนไปต่อ

**Phase 4 — Frontend**
- หน้าโชว์สินค้า/บริการ/ผลงาน (อ่าน API อย่างเดียว)
- ตะกร้าเลือกสินค้า + ฟอร์มขอใบเสนอราคา
- Admin dashboard: login → รายการคำขอ → ปรับราคา/ออก PDF

**Phase 5 — ย้ายเนื้อหา + UAT**
- ย้ายเนื้อหาจาก WordPress เดิมแบบใส่มือผ่านหน้า admin
- ให้ทีมขายทดลองใช้งานจริงก่อน launch

**Phase 6 — Deploy & launch**
- deploy ขึ้น staging (Netlify + Render + Neon + R2) ทดสอบให้ครบ
- ตั้งโดเมน merchanic.co ชี้เข้า production + SSL
- ตั้ง error logging/monitoring (เช่น Sentry)
- ส่งมอบเอกสารดูแลระบบให้ Admin

---

## 7. Repo structure

**แนะนำ: Monorepo เดียว** แบ่งเป็น 2 โฟลเดอร์หลัก แทนการแยก 2 repo:

```
merchanic/
├── apps/
│   ├── frontend/     # React (public site + admin dashboard)
│   └── backend/      # NestJS API + Prisma schema
├── docs/
│   └── blueprint.md  # ไฟล์นี้
└── docker-compose.yml
```

เหตุผล: ทีมเล็ก, frontend/backend พัฒนาคู่กันตลอด (ทุกครั้งที่ schema เปลี่ยน ทั้งสองฝั่งมักต้องแก้พร้อมกัน) — monorepo ทำให้เห็น diff ของทั้งระบบใน PR เดียว ไม่ต้องคอยซิงก์ 2 repo แยกกัน และ Render/Netlify ทั้งคู่รองรับการ deploy จาก sub-folder ของ monorepo ได้อยู่แล้ว (ตั้งค่า root directory เป็น `apps/frontend` หรือ `apps/backend` ตอน setup)

ถ้าในอนาคตทีมโตขึ้นมากและอยากแยกสิทธิ์ access ระหว่าง frontend/backend repo ชัดเจน ค่อยแยกเป็น 2 repo ทีหลังได้ ไม่ใช่การตัดสินใจที่ย้อนกลับไม่ได้

**Admin dashboard อยู่ที่ไหน:** แนะนำอยู่ใน React app เดียวกับ public site แต่แยก route (เช่น `/admin/*`) และมี route guard เช็ค auth ก่อนเข้า — ไม่ต้องแยกเป็นอีกโปรเจกต์ ประหยัดเวลา setup และ deploy ที่เดียวจบ
