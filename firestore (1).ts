import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  limit,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type {
  SupplierConfig,
  SupplierProduct,
  CsvImportRecord,
  ApiConnection,
  ProfitRule,
  ImportLog,
  SyncHistory,
  SchedulerJob,
} from "@/types";

// ─── Helper ───────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

// ─── Supplier Configs ─────────────────────────────────────────────────────────

export async function getSupplierConfigs(): Promise<SupplierConfig[]> {
  const snap = await getDocs(query(collection(db, "suppliers"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      lastSyncAt: data.lastSyncAt ? toDate(data.lastSyncAt) : undefined,
      connectedAt: data.connectedAt ? toDate(data.connectedAt) : undefined,
    } as SupplierConfig;
  });
}

export async function addSupplierConfig(data: Omit<SupplierConfig, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "suppliers"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSupplierConfig(id: string, data: Partial<SupplierConfig>): Promise<void> {
  await updateDoc(doc(db, "suppliers", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSupplierConfig(id: string): Promise<void> {
  await deleteDoc(doc(db, "suppliers", id));
}

// ─── Supplier Products ────────────────────────────────────────────────────────

export async function getSupplierProducts(constraints: QueryConstraint[] = []): Promise<SupplierProduct[]> {
  const q = query(collection(db, "supplier_products"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      importedAt: toDate(data.importedAt),
      updatedAt: toDate(data.updatedAt),
      lastSyncAt: data.lastSyncAt ? toDate(data.lastSyncAt) : undefined,
    } as SupplierProduct;
  });
}

export async function bulkAddSupplierProducts(products: Omit<SupplierProduct, "id">[]): Promise<number> {
  let count = 0;
  for (const product of products) {
    await addDoc(collection(db, "supplier_products"), {
      ...product,
      importedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }
  return count;
}

export async function updateSupplierProduct(id: string, data: Partial<SupplierProduct>): Promise<void> {
  await updateDoc(doc(db, "supplier_products", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSupplierProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "supplier_products", id));
}

export async function bulkUpdateSupplierProductStatus(
  ids: string[],
  status: SupplierProduct["status"]
): Promise<void> {
  await Promise.all(ids.map((id) => updateSupplierProduct(id, { status })));
}

// ─── CSV Imports ──────────────────────────────────────────────────────────────

export async function getCsvImports(): Promise<CsvImportRecord[]> {
  const snap = await getDocs(query(collection(db, "csv_imports"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      startedAt: toDate(data.startedAt),
      createdAt: toDate(data.createdAt),
      completedAt: data.completedAt ? toDate(data.completedAt) : undefined,
    } as CsvImportRecord;
  });
}

export async function addCsvImport(data: Omit<CsvImportRecord, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "csv_imports"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCsvImport(id: string, data: Partial<CsvImportRecord>): Promise<void> {
  await updateDoc(doc(db, "csv_imports", id), data);
}

// ─── API Connections ──────────────────────────────────────────────────────────

export async function getApiConnections(): Promise<ApiConnection[]> {
  const snap = await getDocs(query(collection(db, "api_connections"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      lastTestedAt: data.lastTestedAt ? toDate(data.lastTestedAt) : undefined,
    } as ApiConnection;
  });
}

export async function addApiConnection(data: Omit<ApiConnection, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "api_connections"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateApiConnection(id: string, data: Partial<ApiConnection>): Promise<void> {
  await updateDoc(doc(db, "api_connections", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteApiConnection(id: string): Promise<void> {
  await deleteDoc(doc(db, "api_connections", id));
}

// ─── Profit Rules ─────────────────────────────────────────────────────────────

export async function getProfitRules(): Promise<ProfitRule[]> {
  const snap = await getDocs(query(collection(db, "profit_rules"), orderBy("priority", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as ProfitRule;
  });
}

export async function addProfitRule(data: Omit<ProfitRule, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "profit_rules"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProfitRule(id: string, data: Partial<ProfitRule>): Promise<void> {
  await updateDoc(doc(db, "profit_rules", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProfitRule(id: string): Promise<void> {
  await deleteDoc(doc(db, "profit_rules", id));
}

// ─── Import Logs ──────────────────────────────────────────────────────────────

export async function getImportLogs(limitCount = 50): Promise<ImportLog[]> {
  const snap = await getDocs(
    query(collection(db, "supplier_logs"), orderBy("createdAt", "desc"), limit(limitCount))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toDate(data.createdAt) } as ImportLog;
  });
}

export async function addImportLog(data: Omit<ImportLog, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "supplier_logs"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Sync History ─────────────────────────────────────────────────────────────

export async function getSyncHistory(limitCount = 50): Promise<SyncHistory[]> {
  const snap = await getDocs(
    query(collection(db, "sync_history"), orderBy("startedAt", "desc"), limit(limitCount))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      startedAt: toDate(data.startedAt),
      completedAt: data.completedAt ? toDate(data.completedAt) : undefined,
    } as SyncHistory;
  });
}

export async function addSyncHistory(data: Omit<SyncHistory, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "sync_history"), data);
  return ref.id;
}

// ─── Scheduler Jobs ───────────────────────────────────────────────────────────

export async function getSchedulerJobs(): Promise<SchedulerJob[]> {
  const snap = await getDocs(collection(db, "scheduler_jobs"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      lastRunAt: data.lastRunAt ? toDate(data.lastRunAt) : undefined,
      nextRunAt: data.nextRunAt ? toDate(data.nextRunAt) : undefined,
    } as SchedulerJob;
  });
}
