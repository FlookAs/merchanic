interface ConfirmationData {
  refNumber: string;
  submittedAt: Date;
  customerName: string;
  company?: string | null;
  email: string;
  phone: string;
  message?: string | null;
  items: {
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  estimatedTotal: number;
}

export function renderConfirmationHtml(data: ConfirmationData): string {
  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

  const dateStr = data.submittedAt.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows = data.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${i + 1}</td>
        <td style="padding:8px;border:1px solid #ddd">${item.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.unit}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${fmt(item.total)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #333; margin: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .title { color: #1e40af; font-size: 22px; font-weight: bold; margin: 0 0 4px; }
    .subtitle { color: #64748b; font-size: 13px; }
    .company-info { font-size: 12px; color: #666; margin-top: 4px; }
    .notice {
      background: #fefce8; border: 1px solid #fde047; border-radius: 6px;
      padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #854d0e;
    }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 13px; }
    .totals { float: right; width: 300px; }
    .totals table td { padding: 6px 8px; border: 1px solid #ddd; font-size: 13px; }
    .totals td:last-child { text-align: right; }
    .estimated { font-weight: bold; background: #eff6ff; color: #1e40af; }
    .footer { margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .ref { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <p class="title">ใบยืนยันคำขอใบเสนอราคา</p>
      <p class="subtitle">เราได้รับคำขอของคุณแล้ว ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ</p>
      <div class="company-info">
        <strong>Merchanic Co., Ltd.</strong> — บริการวิศวกรรมและซ่อมบำรุงอุตสาหกรรม
      </div>
    </div>
    <div style="text-align:right">
      <div class="ref"><strong>หมายเลขอ้างอิง:</strong> ${data.refNumber}</div>
      <div class="ref"><strong>วันที่ส่งคำขอ:</strong> ${dateStr}</div>
    </div>
  </div>

  <div style="margin-bottom:16px">
    <strong>ข้อมูลผู้ติดต่อ:</strong><br>
    ${data.customerName}${data.company ? ` — ${data.company}` : ''}<br>
    อีเมล: ${data.email} | โทร: ${data.phone}
    ${data.message ? `<br><em style="color:#64748b">"${data.message}"</em>` : ''}
  </div>

  <div class="notice">
    ⚠️ <strong>หมายเหตุ:</strong> ราคาในเอกสารนี้เป็นราคาอ้างอิงเบื้องต้น
    ราคาจริงอาจมีการปรับเปลี่ยนหลังจากทีมงานตรวจสอบรายละเอียดงาน
    และจะแจ้งใบเสนอราคาอย่างเป็นทางการอีกครั้ง
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">ที่</th>
        <th>รายการ</th>
        <th style="width:60px;text-align:center">จำนวน</th>
        <th style="width:60px;text-align:center">หน่วย</th>
        <th style="width:120px;text-align:right">ราคาต่อหน่วย</th>
        <th style="width:120px;text-align:right">รวม</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>ยอดก่อน VAT</td><td>${fmt(data.subtotal)}</td></tr>
      <tr><td>VAT ${data.taxRate}%</td><td>${fmt(data.taxAmount)}</td></tr>
      <tr class="estimated">
        <td><strong>ราคาประมาณการ (บาท)</strong></td>
        <td><strong>${fmt(data.estimatedTotal)}</strong></td>
      </tr>
    </table>
  </div>

  <div style="clear:both"></div>
  <div class="footer">
    เอกสารนี้ออกโดยระบบอัตโนมัติ — ไม่ใช่ใบเสนอราคาอย่างเป็นทางการ
  </div>
</body>
</html>`;
}
