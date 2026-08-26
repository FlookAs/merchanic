export type Role = 'ADMIN' | 'SALES'

export type QuoteStatus = 'NEW' | 'REVIEWING' | 'ADJUSTED' | 'QUOTED' | 'CLOSED'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  categoryId: string
  category?: Category
  name: string
  description: string
  unitPrice: string
  unit: string
  imageKeys: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Portfolio {
  id: string
  title: string
  description: string
  imageKeys: string[]
  relatedServiceId: string | null
  relatedService?: Category
  createdAt: string
  updatedAt: string
}

export interface StaffUser {
  id: string
  email: string
  role: Role
}

export interface QuoteRequestItem {
  id: string
  quoteRequestId: string
  productId: string
  product?: Product
  quantity: number
  unitPriceSnapshot: string
  adjustedUnitPrice: string | null
  createdAt: string
  updatedAt: string
}

export interface QuoteDocument {
  id: string
  quoteRequestId: string
  documentNumber: string
  subtotal: string
  taxAmount: string
  discountAmount: string
  grandTotal: string
  pdfKey: string | null
  issuedAt: string
  createdAt: string
  updatedAt: string
}

export interface QuoteRequest {
  id: string
  customerName: string
  company: string | null
  email: string
  phone: string
  message: string | null
  status: QuoteStatus
  assignedToId: string | null
  assignedTo?: StaffUser | null
  autoTotal: string
  taxRate: string
  discountAmount: string
  finalTotal: string
  items: QuoteRequestItem[]
  quoteDocuments: QuoteDocument[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  name: string
  unit: string
  unitPriceSnapshot: string
  quantity: number
}
