const SYMBOLS = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  SGD: "S$",
  AED: "د.إ",
};

export function formatMoney(amount, currency = "BDT") {
  const symbol = SYMBOLS[currency] || currency + " ";
  const value = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${symbol}${value}`;
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export const CURRENCIES = Object.keys(SYMBOLS);
