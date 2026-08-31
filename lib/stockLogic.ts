export type StockStatusType = "AMAN" | "LOW" | "RESTOCK" | "HABIS" | "BELUM_DIATUR";

export interface StockStatusResult {
  status: StockStatusType;
  label: string;
  variant: "success" | "warning" | "destructive" | "secondary" | "outline";
  explanation: string;
  currentStock: number;
  lowStockThreshold: number | null;
  reorderPoint: number | null;
  source: "product" | "global" | "none";
  uom: string;
}

export interface CalculateStockParams {
  currentStock: number;
  lowStockThreshold?: number | null;
  reorderPoint?: number | null;
  globalLowThreshold?: number | null;
  globalReorderPoint?: number | null;
  uom?: string;
}

/**
 * Calculates dynamic stock status based on:
 * 1. current_stock
 * 2. low_stock_threshold
 * 3. reorder_point
 * 
 * Rules:
 * - currentStock === 0 -> HABIS
 * - currentStock <= reorderPoint -> RESTOCK
 * - reorderPoint < currentStock <= lowStockThreshold -> LOW
 * - currentStock > lowStockThreshold -> AMAN
 * - If no threshold configured -> BELUM_DIATUR (Priority: Product threshold -> Global threshold -> Belum Diatur)
 */
export function calculateStockStatus({
  currentStock,
  lowStockThreshold,
  reorderPoint,
  globalLowThreshold = null,
  globalReorderPoint = null,
  uom = "PCS",
}: CalculateStockParams): StockStatusResult {
  const stockVal = Number(currentStock) || 0;

  // Determine effective thresholds (Priority: product-specific -> global -> none)
  let effectiveLow: number | null = null;
  let effectiveReorder: number | null = null;
  let source: "product" | "global" | "none" = "none";

  const hasProductLow = lowStockThreshold !== undefined && lowStockThreshold !== null && String(lowStockThreshold).trim() !== "" && !isNaN(Number(lowStockThreshold));
  const hasProductReorder = reorderPoint !== undefined && reorderPoint !== null && String(reorderPoint).trim() !== "" && !isNaN(Number(reorderPoint));

  if (hasProductLow) {
    effectiveLow = Number(lowStockThreshold);
    effectiveReorder = hasProductReorder ? Number(reorderPoint) : 0;
    source = "product";
  } else if (globalLowThreshold !== null && globalLowThreshold !== undefined && !isNaN(Number(globalLowThreshold))) {
    effectiveLow = Number(globalLowThreshold);
    effectiveReorder = globalReorderPoint !== null && globalReorderPoint !== undefined && !isNaN(Number(globalReorderPoint)) ? Number(globalReorderPoint) : 0;
    source = "global";
  }

  // If no thresholds configured:
  if (effectiveLow === null) {
    return {
      status: "BELUM_DIATUR",
      label: "Belum Diatur",
      variant: "secondary",
      explanation: `Threshold belum diatur (Stok: ${stockVal} ${uom}). Atur batas minimum stok & reorder point di Master Produk.`,
      currentStock: stockVal,
      lowStockThreshold: null,
      reorderPoint: null,
      source: "none",
      uom,
    };
  }

  // 1. HABIS (stok 0 atau minus)
  if (stockVal <= 0) {
    return {
      status: "HABIS",
      label: "HABIS",
      variant: "destructive",
      explanation: `Stok saat ini: 0 ${uom}. Stok kosong! Segera buat Purchase Order ke supplier (Reorder Point: ≤ ${effectiveReorder} ${uom}).`,
      currentStock: 0,
      lowStockThreshold: effectiveLow,
      reorderPoint: effectiveReorder,
      source,
      uom,
    };
  }

  // 2. RESTOCK (stok <= reorder point)
  if (effectiveReorder !== null && stockVal <= effectiveReorder) {
    return {
      status: "RESTOCK",
      label: "RESTOCK",
      variant: "destructive",
      explanation: `Stok saat ini: ${stockVal} ${uom} | Kritis: ≤ ${effectiveReorder} ${uom} (Batas Low: ${effectiveLow} ${uom}). Segera lakukan pemesanan ulang.`,
      currentStock: stockVal,
      lowStockThreshold: effectiveLow,
      reorderPoint: effectiveReorder,
      source,
      uom,
    };
  }

  // 3. LOW (reorder point < stok <= low threshold)
  if (stockVal <= effectiveLow) {
    return {
      status: "LOW",
      label: "LOW",
      variant: "warning",
      explanation: `Stok saat ini: ${stockVal} ${uom} | Batas Low: ${effectiveLow} ${uom} | Restock pada: ≤ ${effectiveReorder ?? 0} ${uom}.`,
      currentStock: stockVal,
      lowStockThreshold: effectiveLow,
      reorderPoint: effectiveReorder,
      source,
      uom,
    };
  }

  // 4. AMAN (stok > low threshold)
  return {
    status: "AMAN",
    label: "AMAN",
    variant: "success",
    explanation: `Stok saat ini: ${stockVal} ${uom} | Batas Minimum: ${effectiveLow} ${uom} | Restock pada: ≤ ${effectiveReorder ?? 0} ${uom}. Stok dalam kondisi aman.`,
    currentStock: stockVal,
    lowStockThreshold: effectiveLow,
    reorderPoint: effectiveReorder,
    source,
    uom,
  };
}
