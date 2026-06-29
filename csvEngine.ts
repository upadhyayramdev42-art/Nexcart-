import type { CsvPreviewRow, CsvColumnMapping, CsvImportError, SupplierProduct } from "@/types";

// ─── Parse CSV text ───────────────────────────────────────────────────────────

export function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Validate CSV rows ────────────────────────────────────────────────────────

export function validateCsvRows(
  rows: Record<string, string>[],
  mapping: CsvColumnMapping
): CsvPreviewRow[] {
  return rows.map((data, i) => {
    const errors: string[] = [];

    if (mapping.name && !data[mapping.name]?.trim()) {
      errors.push("Product name is required");
    }
    if (mapping.sku && !data[mapping.sku]?.trim()) {
      errors.push("SKU is required");
    }
    if (mapping.costPrice && data[mapping.costPrice]) {
      const price = parseFloat(data[mapping.costPrice]);
      if (isNaN(price) || price < 0) errors.push("Invalid cost price");
    }
    if (mapping.stock && data[mapping.stock]) {
      const stock = parseInt(data[mapping.stock]);
      if (isNaN(stock) || stock < 0) errors.push("Invalid stock value");
    }

    return {
      rowIndex: i + 2,
      data,
      hasError: errors.length > 0,
      errorMessage: errors.join(", "),
    };
  });
}

// ─── Map CSV row to SupplierProduct ───────────────────────────────────────────

export function mapRowToProduct(
  row: Record<string, string>,
  mapping: CsvColumnMapping,
  supplierId: string,
  supplierName: string,
  profitRules: { type: "fixed" | "percentage"; value: number }
): Omit<SupplierProduct, "id"> {
  const costPrice = parseFloat(row[mapping.costPrice] ?? "0") || 0;
  const profit =
    profitRules.type === "percentage"
      ? costPrice * (profitRules.value / 100)
      : profitRules.value;
  const sellingPrice = costPrice + profit;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const imageVal = row[mapping.images] ?? "";
  const images = imageVal ? imageVal.split("|").map((s) => s.trim()).filter(Boolean) : [];

  return {
    supplierId,
    supplierName,
    supplierSKU: row[mapping.sku] ?? "",
    name: row[mapping.name] ?? "",
    description: row[mapping.description] ?? "",
    category: row[mapping.category] ?? "Uncategorized",
    brand: row[mapping.brand] ?? "",
    images,
    costPrice,
    sellingPrice: parseFloat(sellingPrice.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    stock: parseInt(row[mapping.stock] ?? "0") || 0,
    status: "unpublished",
    importedAt: new Date(),
    updatedAt: new Date(),
    rawData: row,
  };
}

// ─── Build CSV Error Report ───────────────────────────────────────────────────

export function buildErrorReport(errors: CsvImportError[]): string {
  const header = "Row,Field,Value,Error\n";
  const lines = errors.map(
    (e) => `${e.row},"${e.field}","${e.value}","${e.message}"`
  );
  return header + lines.join("\n");
}

// ─── Download file helper ─────────────────────────────────────────────────────

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Generate export CSV from products ───────────────────────────────────────

export function exportProductsToCsv(products: SupplierProduct[]): string {
  const headers = ["Name", "SKU", "Category", "Brand", "Cost Price", "Selling Price", "Profit", "Stock", "Status", "Supplier"];
  const rows = products.map((p) => [
    `"${p.name}"`,
    `"${p.supplierSKU}"`,
    `"${p.category}"`,
    `"${p.brand}"`,
    p.costPrice,
    p.sellingPrice,
    p.profit,
    p.stock,
    p.status,
    `"${p.supplierName}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
