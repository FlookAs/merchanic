export class PrismaClient {
  constructor(_opts?: unknown) {}
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
}

export const Role = { ADMIN: 'ADMIN', SALES: 'SALES' } as const;
export const QuoteStatus = {
  NEW: 'NEW',
  REVIEWING: 'REVIEWING',
  ADJUSTED: 'ADJUSTED',
  QUOTED: 'QUOTED',
  CLOSED: 'CLOSED',
} as const;
