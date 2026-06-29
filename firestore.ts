import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type {
  AppUser,
  MyProduct,
  DropshippingProduct,
  Supplier,
  Order,
  FirestoreCategory,
  DashboardStats,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name,
      email: data.email,
      role: data.role,
      emailVerified: data.emailVerified ?? false,
      photoURL: data.photoURL,
      phone: data.phone,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as AppUser;
  });
}

export async function updateUserRole(uid: string, role: "admin" | "customer"): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
}

// ─── My Products ──────────────────────────────────────────────────────────────

export async function getMyProducts(): Promise<MyProduct[]> {
  const snap = await getDocs(collection(db, "my_products"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as MyProduct;
  });
}

export async function addMyProduct(data: Omit<MyProduct, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "my_products"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMyProduct(id: string, data: Partial<MyProduct>): Promise<void> {
  await updateDoc(doc(db, "my_products", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMyProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "my_products", id));
}

// ─── Dropshipping Products ────────────────────────────────────────────────────

export async function getDropshippingProducts(): Promise<DropshippingProduct[]> {
  const snap = await getDocs(collection(db, "dropshipping_products"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, importedAt: toDate(data.importedAt), updatedAt: toDate(data.updatedAt) } as DropshippingProduct;
  });
}

export async function updateDropshippingProduct(id: string, data: Partial<DropshippingProduct>): Promise<void> {
  await updateDoc(doc(db, "dropshipping_products", id), { ...data, updatedAt: serverTimestamp() });
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  const snap = await getDocs(collection(db, "suppliers"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, connectedAt: data.connectedAt ? toDate(data.connectedAt) : undefined } as Supplier;
  });
}

export async function updateSupplierStatus(id: string, status: "connected" | "disconnected"): Promise<void> {
  await updateDoc(doc(db, "suppliers", id), {
    status,
    ...(status === "connected" ? { connectedAt: serverTimestamp() } : {}),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(constraints: QueryConstraint[] = []): Promise<Order[]> {
  const q = query(collection(db, "orders"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) } as Order;
  });
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
}

export async function getCustomerOrders(uid: string): Promise<Order[]> {
  return getOrders([where("customerId", "==", uid), orderBy("createdAt", "desc")]);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<FirestoreCategory[]> {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toDate(data.createdAt) } as FirestoreCategory;
  });
}

export async function addCategory(data: Omit<FirestoreCategory, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<FirestoreCategory>): Promise<void> {
  await updateDoc(doc(db, "categories", id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

// ─── Dashboard Stats (mock aggregation) ──────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const [usersSnap, myProductsSnap, dsProductsSnap, ordersSnap] = await Promise.all([
    getDocs(query(collection(db, "users"), where("role", "==", "customer"))),
    getDocs(collection(db, "my_products")),
    getDocs(collection(db, "dropshipping_products")),
    getDocs(collection(db, "orders")),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data());
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    totalRevenue,
    totalOrders: ordersSnap.size,
    totalCustomers: usersSnap.size,
    totalProducts: myProductsSnap.size + dsProductsSnap.size,
    revenueChange: 12.5,
    ordersChange: 8.2,
    customersChange: 5.1,
    productsChange: 3.7,
  };
}

export async function getRecentOrders(count = 5) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      customerName: data.customerName,
      total: data.total,
      status: data.status,
      createdAt: toDate(data.createdAt),
    };
  });
}
