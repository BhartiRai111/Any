const ORIGIN_PIN = process.env.STORE_PIN || "221001";

export type DeliveryResult = { ok: true; message: string } | { ok: false; message: string };

/** Checks an Indian PIN code. SERVICEABLE_PIN_PREFIXES (e.g. "22,11,40") limits delivery when set. */
export function checkPin(pin: string): DeliveryResult {
  const p = pin.trim();
  if (!/^[1-9][0-9]{5}$/.test(p)) return { ok: false, message: "Enter a valid 6-digit PIN code" };
  const prefixes = (process.env.SERVICEABLE_PIN_PREFIXES ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  if (prefixes.length > 0 && !prefixes.some((x) => p.startsWith(x))) return { ok: false, message: "Sorry, we do not deliver to this PIN code yet" };
  const days = p.slice(0, 2) === ORIGIN_PIN.slice(0, 2) ? "2 to 3" : p[0] === ORIGIN_PIN[0] ? "3 to 5" : "5 to 8";
  return { ok: true, message: `We deliver to ${p}. Usually ${days} working days after dispatch.` };
}
