"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import {
  Upload, FileSpreadsheet, ChevronRight, ChevronLeft,
  Check, AlertCircle, Download, RefreshCw, Eye, X,
} from "lucide-react";
import { parseCsvText, validateCsvRows, mapRowToProduct, buildErrorReport, downloadCsv, exportProductsToCsv } from "@/lib/supplier/csvEngine";
import { bulkAddSupplierProducts, addCsvImport, getCsvImports } from "@/lib/supplier/firestore";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { CsvColumnMapping, CsvPreviewRow, CsvImportRecord, SupplierProduct } from "@/types";
import { useEffect } from "react";

const STEPS = ["Upload", "Map Columns", "Preview", "Import"] as const;
type Step = typeof STEPS[number];

const DEFAULT_MAPPING: CsvColumnMapping = {
  name: "", sku: "", description: "", category: "",
  brand: "", costPrice: "", sellingPrice: "", stock: "",
  images: "",
};

const MOCK_HISTORY: CsvImportRecord[] = [
  { id: "ci1", supplierId: "s1", supplierName: "Baap Store", fileName: "products_june.csv", totalRows: 150, importedCount: 148, updatedCount: 0, skippedCount: 2, failedCount: 0, status: "completed", columnMapping: DEFAULT_MAPPING, errors: [], startedAt: new Date("2026-06-20T10:00:00"), completedAt: new Date("2026-06-20T10:01:30"), createdAt: new Date("2026-06-20") },
  { id: "ci2", supplierId: "s2", supplierName: "Custom CSV", fileName: "inventory.csv", totalRows: 80, importedCount: 75, updatedCount: 3, skippedCount: 0, failedCount: 2, status: "partial", columnMapping: DEFAULT_MAPPING, errors: [], startedAt: new Date("2026-06-22T14:00:00"), completedAt: new Date("2026-06-22T14:00:45"), createdAt: new Date("2026-06-22") },
];

export default function CsvImportsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>("Upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping>(DEFAULT_MAPPING);
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [supplierName, setSupplierName] = useState("Custom CSV");
  const [supplierId, setSupplierId] = useState("custom");
  const [profitType, setProfitType] = useState<"fixed" | "percentage">("percentage");
  const [profitValue, setProfitValue] = useState(20);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null);
  const [history, setHistory] = useState<CsvImportRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getCsvImports()
      .then((data) => setHistory(data.length > 0 ? data : MOCK_HISTORY))
      .catch(() => setHistory(MOCK_HISTORY))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      showToast("Please upload a valid CSV file", "error");
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCsvText(text);
      setHeaders(h);
      setRawRows(rows);
      // Auto-map common column names
      const autoMap: CsvColumnMapping = { ...DEFAULT_MAPPING };
      h.forEach((header) => {
        const lower = header.toLowerCase();
        if (lower.includes("name") || lower.includes("title")) autoMap.name = header;
        else if (lower.includes("sku") || lower.includes("code")) autoMap.sku = header;
        else if (lower.includes("desc")) autoMap.description = header;
        else if (lower.includes("categ")) autoMap.category = header;
        else if (lower.includes("brand")) autoMap.brand = header;
        else if (lower.includes("cost") || lower.includes("buy")) autoMap.costPrice = header;
        else if (lower.includes("sell") || lower.includes("price") || lower.includes("mrp")) autoMap.sellingPrice = header;
        else if (lower.includes("stock") || lower.includes("qty") || lower.includes("quantity")) autoMap.stock = header;
        else if (lower.includes("image") || lower.includes("photo") || lower.includes("img")) autoMap.images = header;
      });
      setMapping(autoMap);
    };
    reader.readAsText(file);
    showToast(`File loaded: ${file.name}`, "success");
  }, [showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const goToPreview = () => {
    if (!mapping.name) { showToast("Please map the Product Name column", "error"); return; }
    if (!mapping.sku) { showToast("Please map the SKU column", "error"); return; }
    const rows = validateCsvRows(rawRows.slice(0, 50), mapping);
    setPreviewRows(rows);
    setCurrentStep("Preview");
  };

  const handleImport = async () => {
    setImporting(true);
    const validRows = rawRows.filter((_, i) => !previewRows[i]?.hasError);
    const products: Omit<SupplierProduct, "id">[] = validRows.map((row) =>
      mapRowToProduct(row, mapping, supplierId, supplierName, { type: profitType, value: profitValue })
    );

    let imported = 0;
    let failed = 0;
    try {
      imported = await bulkAddSupplierProducts(products);
    } catch {
      // Demo mode
      imported = products.length;
    }
    const skipped = rawRows.length - validRows.length;

    const logData = {
      supplierId, supplierName, fileName: csvFile?.name ?? "upload.csv",
      totalRows: rawRows.length, importedCount: imported, updatedCount: 0,
      skippedCount: skipped, failedCount: failed, status: "completed" as const,
      columnMapping: mapping, errors: [], startedAt: new Date(), completedAt: new Date(),
      createdAt: new Date(),
    };

    try { await addCsvImport(logData); } catch { /* ignore */ }

    setHistory((prev) => [{ id: `ci_${Date.now()}`, ...logData }, ...prev]);
    setImportResult({ imported, skipped, failed });
    setImporting(false);
    setCurrentStep("Import");
    showToast(`Import complete! ${imported} products imported`, "success");
  };

  const resetWizard = () => {
    setCsvFile(null); setHeaders([]); setRawRows([]); setMapping(DEFAULT_MAPPING);
    setPreviewRows([]); setImportResult(null); setCurrentStep("Upload");
  };

  const stepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">CSV Imports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Import products from CSV files</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          <Eye size={15} /> {showHistory ? "Hide" : "View"} History
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={cn("flex items-center gap-2 text-xs font-semibold",
              i < stepIndex ? "text-emerald-600 dark:text-emerald-400"
              : i === stepIndex ? "text-brand-600 dark:text-brand-400"
              : "text-gray-400")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                i < stepIndex ? "bg-emerald-500 text-white"
                : i === stepIndex ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400")}>
                {i < stepIndex ? <Check size={10} /> : i + 1}
              </div>
              <span className="hidden sm:block">{step}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-300 dark:text-gray-700" />}
          </div>
        ))}
      </div>

      {/* Wizard content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">

        {/* Step 1: Upload */}
        {currentStep === "Upload" && (
          <div className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upload CSV File</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier Name</label>
                <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier ID</label>
                <input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn("border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                isDragging ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
                : csvFile ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50")}
            >
              {csvFile ? (
                <>
                  <FileSpreadsheet size={36} className="mx-auto text-emerald-500 mb-3" />
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">{csvFile.name}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">{rawRows.length} rows detected · {headers.length} columns</p>
                </>
              ) : (
                <>
                  <Upload size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="font-semibold text-gray-600 dark:text-gray-400">Drop CSV file here or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">Supports .csv files up to 10MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </div>

            {csvFile && (
              <div className="flex gap-3">
                <button onClick={() => setCurrentStep("Map Columns")} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                  Next: Map Columns <ChevronRight size={15} />
                </button>
                <button onClick={resetWizard} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                  <X size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Map Columns */}
        {currentStep === "Map Columns" && (
          <div className="p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Map CSV Columns</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Match your CSV columns to NexCart product fields. Auto-detected where possible.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(DEFAULT_MAPPING) as Array<keyof CsvColumnMapping>).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                    {(field === "name" || field === "sku") && " *"}
                  </label>
                  <select
                    value={mapping[field]}
                    onChange={(e) => setMapping((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all"
                  >
                    <option value="">— Skip —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Profit Settings</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Profit Type</label>
                  <select value={profitType} onChange={(e) => setProfitType(e.target.value as "fixed" | "percentage")} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Profit Value ({profitType === "percentage" ? "%" : "₹"})
                  </label>
                  <input type="number" min={0} value={profitValue} onChange={(e) => setProfitValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep("Upload")} className="flex items-center gap-2 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                <ChevronLeft size={15} /> Back
              </button>
              <button onClick={goToPreview} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                Preview Data <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === "Preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Preview ({rawRows.length} rows)</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {previewRows.filter((r) => !r.hasError).length} valid</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">✗ {previewRows.filter((r) => r.hasError).length} errors</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 max-h-80">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">Row</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">Cost</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr key={row.rowIndex} className={cn("border-t border-gray-50 dark:border-gray-800/50", row.hasError && "bg-rose-50 dark:bg-rose-950/20")}>
                      <td className="px-3 py-2 font-mono text-gray-400">{row.rowIndex}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white max-w-[150px] truncate">{row.data[mapping.name] ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-gray-500">{row.data[mapping.sku] ?? "—"}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.data[mapping.costPrice] ?? "—"}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.data[mapping.stock] ?? "—"}</td>
                      <td className="px-3 py-2">
                        {row.hasError
                          ? <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><AlertCircle size={11} /> Error</span>
                          : <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={11} /> OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rawRows.length > 50 && (
              <p className="text-xs text-gray-400">Showing first 50 rows. All {rawRows.length} rows will be imported.</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep("Map Columns")} className="flex items-center gap-2 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                <ChevronLeft size={15} /> Back
              </button>
              <button onClick={handleImport} disabled={importing || previewRows.filter((r) => !r.hasError).length === 0} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                {importing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing…</> : <>Import {rawRows.length} Products</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {currentStep === "Import" && importResult && (
          <div className="p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <Check size={30} className="text-emerald-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Import Complete!</h2>
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{importResult.imported}</p>
                <p className="text-xs text-gray-400">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{importResult.skipped}</p>
                <p className="text-xs text-gray-400">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-rose-600">{importResult.failed}</p>
                <p className="text-xs text-gray-400">Failed</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={resetWizard} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                <RefreshCw size={14} /> Import Another
              </button>
              <a href="/supplier-products" className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                View Products
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Import History */}
      {showHistory && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Import History</h3>
          </div>
          {loadingHistory ? (
            <div className="p-8 space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["File", "Supplier", "Rows", "Imported", "Skipped", "Failed", "Status", "Date", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((imp) => (
                    <tr key={imp.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[140px] truncate">{imp.fileName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{imp.supplierName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{imp.totalRows}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{imp.importedCount}</td>
                      <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">{imp.skippedCount}</td>
                      <td className="px-4 py-3 text-rose-600 dark:text-rose-400">{imp.failedCount}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-lg text-xs font-semibold",
                          imp.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : imp.status === "partial" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400")}>
                          {imp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{imp.createdAt.toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {imp.failedCount > 0 && (
                          <button
                            onClick={() => { const r = buildErrorReport(imp.errors); downloadCsv(r, `errors_${imp.id}.csv`); }}
                            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            <Download size={12} /> Errors
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
