export enum Role {
  SuperAdmin = 'SuperAdmin',
  CompanyAdmin = 'CompanyAdmin',
  Manager = 'Manager',
  Viewer = 'Viewer'
}

export interface User {
  id: number;
  email: string;
  role: Role;
  companyId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  parentCategoryId: number;
  photoUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentCategoryId?: number | null;
  subCategories?: SubCategory[];
  photoUrl?: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  quantityType: string;
  categoryId: number;
  categoryName: string;
  photoUrl?: string;
}

export interface Notification {
  id: number;
  senderId: number;
  senderEmail: string;
  recipientId: number;
  recipientEmail: string;
  message: string;
  sentAt: string;
  isRead: boolean;
}

export interface SummaryData {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  totalCategories: number;
  lowStockItemsCount: number;
}
