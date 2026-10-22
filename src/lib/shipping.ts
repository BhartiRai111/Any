export const SHIPPING_CENTS = 700;
export const FREE_SHIPPING_OVER = 10000;

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_OVER ? 0 : SHIPPING_CENTS;
}
