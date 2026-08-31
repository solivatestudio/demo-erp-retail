export type SalesReceiptLine = {
  sku: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  subtotal: number;
};

export type SalesReceipt = {
  number: string;
  date: string;
  cashier: string;
  customer: string;
  customerGroup: string;
  warehouse: string;
  total: number;
  paid: number;
  change: number;
  lines: SalesReceiptLine[];
};

const receiptKey = "kelolain:sales-receipts";
const stockKey = "kelolain:stock-toko";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getSalesReceipts(): SalesReceipt[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(receiptKey) ?? "[]") as SalesReceipt[];
  } catch {
    return [];
  }
}

export function saveSalesReceipt(receipt: SalesReceipt) {
  if (!canUseStorage()) return;
  const current = getSalesReceipts();
  window.localStorage.setItem(receiptKey, JSON.stringify([receipt, ...current].slice(0, 25)));
}

export function getStockSnapshot(): Record<string, number> {
  if (!canUseStorage()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(stockKey) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export function saveStockSnapshot(stock: Record<string, number>) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(stockKey, JSON.stringify(stock));
}
