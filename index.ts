// ─── Storefront Types (Module 01) ────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  badge?: "new" | "sale" | "hot" | "limited";
  isWishlisted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

// ─── Auth / User Types (Module 02) ───────────────────────────────────────────

export type UserRole = "admin" | "customer";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  photoURL?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── My Product (Admin-owned) ─────────────────────────────────────────────────

export type ProductStatus = "active" | "inactive" | "draft" | "out_of_stock";
export type ProductType = "my_product" | "dropshipping";

export interface MyProduct {
  id: string;
  type: "my_product";
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  images: string[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // uid
}

// ─── Dropshipping Product ─────────────────────────────────────────────────────

export type DropshippingStatus = "active" | "inactive" | "out_of_stock";

export interface DropshippingProduct {
  id: string;
  type: "dropshipping";
  supplierId: string;
  supplierName: string;
  supplierSKU: string;
  name: string;
  category: string;
  images: string[];
  costPrice: number;
  sellingPrice: number;
  profit: number;
  stock: number;
  status: DropshippingStatus;
  importedAt: Date;
  updatedAt: Date;
}

// ─── Supplier ─────────────────────────────────────────────────────────────────

export type SupplierStatus = "connected" | "disconnected";
export type SupplierKey =
  | "baap_store"
  | "meesho"
  | "udaan"
  | "indiamart"
  | "tradeindia"
  | "cj_dropshipping"
  | "aliexpress";

export interface Supplier {
  id: string;
  key: SupplierKey;
  name: string;
  logo: string;
  description: string;
  status: SupplierStatus;
  productCount: number;
  website: string;
  connectedAt?: Date;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  productType: ProductType;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Firestore Category ───────────────────────────────────────────────────────

export interface FirestoreCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  parentId?: string;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}
