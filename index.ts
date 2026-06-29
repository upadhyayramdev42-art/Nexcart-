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

// ─── Module 03 — Universal Supplier Engine ────────────────────────────────────

export type SupplierType = "csv" | "api" | "manual";
export type SupplierConnectionStatus = "connected" | "disconnected" | "error" | "testing";

export interface SupplierConfig {
  id: string;
  supplierKey: string;
  name: string;
  logo: string;
  type: SupplierType;
  status: SupplierConnectionStatus;
  website: string;
  description: string;
  // API config
  apiBaseUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  customHeaders?: Record<string, string>;
  webhookUrl?: string;
  notes?: string;
  // Stats
  productCount: number;
  lastSyncAt?: Date;
  connectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Supplier Product ─────────────────────────────────────────────────────────

export type SupplierProductStatus = "published" | "unpublished" | "syncing" | "error";

export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierSKU: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  costPrice: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  stock: number;
  status: SupplierProductStatus;
  importedAt: Date;
  lastSyncAt?: Date;
  updatedAt: Date;
  // Raw source data
  rawData?: Record<string, string>;
}

// ─── CSV Import ───────────────────────────────────────────────────────────────

export type CsvImportStatus = "pending" | "processing" | "completed" | "failed" | "partial";

export interface CsvColumnMapping {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  images: string;
  [key: string]: string;
}

export interface CsvImportRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  status: CsvImportStatus;
  columnMapping: CsvColumnMapping;
  errors: CsvImportError[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface CsvImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvPreviewRow {
  rowIndex: number;
  data: Record<string, string>;
  hasError: boolean;
  errorMessage?: string;
}

// ─── API Connection ───────────────────────────────────────────────────────────

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiConnectionStatus = "idle" | "testing" | "success" | "error";

export interface ApiConnection {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  baseUrl: string;
  method: ApiMethod;
  endpoint: string;
  authType: "bearer" | "api_key" | "basic" | "none";
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  customHeaders: Record<string, string>;
  paginationType: "page" | "cursor" | "offset" | "none";
  pageParam?: string;
  pageSizeParam?: string;
  pageSize: number;
  timeout: number;
  retryCount: number;
  status: ApiConnectionStatus;
  lastTestedAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Profit Rules ─────────────────────────────────────────────────────────────

export type ProfitRuleType = "fixed" | "percentage";
export type ProfitRuleScope = "global" | "supplier" | "category";

export interface ProfitRule {
  id: string;
  name: string;
  type: ProfitRuleType;
  scope: ProfitRuleScope;
  value: number;           // fixed amount or percentage
  supplierId?: string;
  supplierName?: string;
  category?: string;
  isActive: boolean;
  priority: number;        // higher = evaluated first
  createdAt: Date;
  updatedAt: Date;
}

// ─── Import Log ───────────────────────────────────────────────────────────────

export type ImportLogStatus = "success" | "partial" | "failed";
export type ImportSource = "csv" | "api" | "manual";

export interface ImportLog {
  id: string;
  supplierId: string;
  supplierName: string;
  source: ImportSource;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  status: ImportLogStatus;
  durationMs: number;
  notes?: string;
  createdAt: Date;
}

// ─── Sync History ─────────────────────────────────────────────────────────────

export type SyncType = "product" | "price" | "stock" | "image" | "full";
export type SyncStatus = "pending" | "running" | "completed" | "failed";

export interface SyncHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  syncType: SyncType;
  status: SyncStatus;
  affectedCount: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// ─── Scheduler Job ────────────────────────────────────────────────────────────

export type SchedulerFrequency = "manual" | "hourly" | "daily" | "weekly";
export type SchedulerJobStatus = "active" | "inactive" | "running" | "error";

export interface SchedulerJob {
  id: string;
  supplierId: string;
  supplierName: string;
  syncType: SyncType;
  frequency: SchedulerFrequency;
  status: SchedulerJobStatus;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
