// Deterministic, server-side supply/demand pricing.
// Buying pressure pushes price up, selling pressure pushes it down.
// Impact is bounded so a single order can't send the price to an
// unreasonable extreme, and price is always clamped above a floor.

const MIN_PRICE = 0.5;
const MAX_IMPACT = 0.12; // a single order moves price by at most 12%
const IMPACT_DIVISOR = 400; // larger = less sensitive market

export function applyBuyPressure(currentPrice: number, hypeAmount: number): number {
  const impact = Math.min(MAX_IMPACT, hypeAmount / (currentPrice * IMPACT_DIVISOR));
  return roundPrice(currentPrice * (1 + impact));
}

export function applySellPressure(currentPrice: number, hypeAmount: number): number {
  const impact = Math.min(MAX_IMPACT, hypeAmount / (currentPrice * IMPACT_DIVISOR));
  return roundPrice(Math.max(MIN_PRICE, currentPrice * (1 - impact)));
}

export function roundPrice(price: number): number {
  return Math.max(MIN_PRICE, Math.round(price * 100) / 100);
}

export function roundUnits(units: number): number {
  return Math.round(units * 1e6) / 1e6;
}

export function roundHype(amount: number): number {
  return Math.round(amount * 100) / 100;
}
