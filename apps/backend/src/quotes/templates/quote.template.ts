interface QuoteData {
  documentNumber: string;
  issuedAt: Date;
  customerName: string;
  company?: string | null;
  email: string;
  phone: string;
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
  discountAmount: number;
  grandTotal: number;
}

export function renderQuoteHtml(data: QuoteData): string {
  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

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

  const dateStr = data.issuedAt.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #333; margin: 40px; }
    h1 { color: #1a56db; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .company-info { font-size: 12px; color: #666; }
    .doc-info { text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { background: #1a56db; color: white; padding: 10px 8px; text-align: left; }
    .totals { float: right; width: 320px; }
    .totals table td { padding: 6px 8px; border: 1px solid #ddd; }
    .totals td:last-child { text-align: right; }
    .grand-total { font-weight: bold; background: #f0f4ff; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ใบเสนอราคา</h1>
      <div class="company-info">
        <strong>Merchanic Co., Ltd.</strong><br>
        บริการวิศวกรรมและซ่อมบำรุงอุตสาหกรรม
      </div>
    </div>
    <div class="doc-info">
      <div><strong>เลขที่:</strong> ${data.documentNumber}</div>
      <div><strong>วันที่:</strong> ${dateStr}</div>
    </div>
  </div>

  <div style="margin-bottom:24px">
    <strong>เสนอให้กับ:</strong><br>
    ${data.customerName}${data.company ? ` — ${data.company}` : ''}<br>
    อีเมล: ${data.email} | โทร: ${data.phone}
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
      ${data.discountAmount > 0 ? `<tr><td>ส่วนลด</td><td>-${fmt(data.discountAmount)}</td></tr>` : ''}
      <tr class="grand-total"><td><strong>รวมทั้งสิ้น (บาท)</strong></td><td><strong>${fmt(data.grandTotal)}</strong></td></tr>
    </table>
  </div>
</body>
</html>`;
}
