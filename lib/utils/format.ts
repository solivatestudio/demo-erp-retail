export const formatRupiah = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat("id-ID").format(Math.round(n));

export const formatDateID = (d: string | Date): string => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");