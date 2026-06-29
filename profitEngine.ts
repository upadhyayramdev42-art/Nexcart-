import type { ProfitRule } from "@/types";

export interface ProfitCalculation {
  costPrice: number;
  profit: number;
  sellingPrice: number;
  profitMargin: number;
  appliedRule: string;
}

// ─── Apply best matching rule ─────────────────────────────────────────────────

export function applyProfitRules(
  costPrice: number,
  rules: ProfitRule[],
  supplierId?: string,
  category?: string
): ProfitCalculation {
  const activeRules = rules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);

  // Priority: supplier-specific > category-specific > global
  const supplierRule = supplierId
    ? activeRules.find((r) => r.scope === "supplier" && r.supplierId === supplierId)
    : undefined;

  const categoryRule = category
    ? activeRules.find((r) => r.scope === "category" && r.category === category)
    : undefined;

  const globalRule = activeRules.find((r) => r.scope === "global");

  const rule = supplierRule ?? categoryRule ?? globalRule;

  if (!rule) {
    // Default 20% margin
    const profit = costPrice * 0.2;
    return {
      costPrice,
      profit: parseFloat(profit.toFixed(2)),
      sellingPrice: parseFloat((costPrice + profit).toFixed(2)),
      profitMargin: 20,
      appliedRule: "Default (20%)",
    };
  }

  const profit =
    rule.type === "percentage"
      ? costPrice * (rule.value / 100)
      : rule.value;

  const sellingPrice = costPrice + profit;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    costPrice,
    profit: parseFloat(profit.toFixed(2)),
    sellingPrice: parseFloat(sellingPrice.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    appliedRule: rule.name,
  };
}

// ─── Live preview for single product ─────────────────────────────────────────

export function previewProfit(
  costPrice: number,
  type: ProfitRule["type"],
  value: number
): ProfitCalculation {
  if (!costPrice || costPrice <= 0) {
    return { costPrice: 0, profit: 0, sellingPrice: 0, profitMargin: 0, appliedRule: "Preview" };
  }

  const profit = type === "percentage" ? costPrice * (value / 100) : value;
  const sellingPrice = costPrice + profit;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    costPrice,
    profit: parseFloat(profit.toFixed(2)),
    sellingPrice: parseFloat(sellingPrice.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    appliedRule: "Preview",
  };
}
