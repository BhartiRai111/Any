export const storeEmail = () => process.env.STORE_EMAIL || "hello@willowandclay.example";

/** Bank lines come from STORE_BANK_DETAILS, separated by "|". Empty means bank transfer is not offered. */
export const bankLines = () => (process.env.STORE_BANK_DETAILS ?? "").split("|").map((l) => l.trim()).filter(Boolean);

export const PAYMENT_METHODS = {
  ONLINE: "Online (UPI, card, net banking)",
  COD: "Pay on delivery",
  BANK_TRANSFER: "Bank transfer",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;
