// All amounts are in paise.
export const SHIPPING_CENTS = 7900;
export const FREE_SHIPPING_OVER = 149900;

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_OVER ? 0 : SHIPPING_CENTS;
}
