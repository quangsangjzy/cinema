export function formatCurrencyVND(amount) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}
export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
}
