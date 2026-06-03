import type { Unit, Dimension } from './db';

// ─── Unit metadata ─────────────────────────────────────────────────────────────

export const UNIT_LABELS: Record<Unit, string> = {
  g: 'Grams (g)',
  kg: 'Kilograms (kg)',
  L: 'Litres (L)',
  mL: 'Millilitres (mL)',
  unit: 'Units (count)',
};

export const DIMENSION_UNITS: Record<Dimension, Unit[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['unit'],
};

export const BASE_UNITS: Record<Dimension, Unit> = {
  weight: 'g',   // always store weight in grams
  volume: 'mL',  // always store volume in mL
  count: 'unit', // always store count in units
};

/**
 * Conversion factors to base unit.
 * factor means: 1 <unit> = factor <base_unit>
 *
 * weight base = g:
 *   1 g  = 1 g     → factor 1
 *   1 kg = 1000 g  → factor 1000
 *
 * volume base = mL:
 *   1 mL = 1 mL    → factor 1
 *   1 L  = 1000 mL → factor 1000
 *
 * count base = unit:
 *   1 unit = 1 unit → factor 1
 */
export const TO_BASE: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
};

/**
 * Convert a quantity from `fromUnit` to the base unit of the dimension.
 * Returns a high-precision decimal string to avoid float drift.
 */
export function toBaseQuantity(quantity: number, fromUnit: Unit): number {
  return quantity * TO_BASE[fromUnit];
}

/**
 * Convert a quantity FROM the base unit TO a display unit.
 */
export function fromBaseQuantity(baseQty: number, toUnit: Unit): number {
  return baseQty / TO_BASE[toUnit];
}

/**
 * Return all supported display units for a given dimension.
 */
export function unitsForDimension(dimension: Dimension): Unit[] {
  return DIMENSION_UNITS[dimension];
}

/**
 * Given a product's base_unit price per 1 base_unit (in paise),
 * compute the price per 1 unit of displayUnit (also in paise).
 */
export function pricePerDisplayUnit(
  pricePerBaseUnitPaise: number,
  baseUnit: Unit,
  displayUnit: Unit
): number {
  // 1 displayUnit = TO_BASE[displayUnit] base units
  return pricePerBaseUnitPaise * TO_BASE[displayUnit];
}

/**
 * Compute the total cost (paise) for an order line.
 * orderedQty is in orderedUnit; pricePerBaseUnitPaise is price for 1 base unit.
 */
export function computeLineTotalPaise(
  orderedQty: number,
  orderedUnit: Unit,
  pricePerBaseUnitPaise: number
): number {
  const baseQty = toBaseQuantity(orderedQty, orderedUnit);
  return baseQty * pricePerBaseUnitPaise;
}

// ─── INR formatting ───────────────────────────────────────────────────────────

export function paiseToCurrency(paise: number | string): string {
  const amount = Number(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function currencyToPaise(inr: number): number {
  return Math.round(inr * 100);
}

export function formatQuantity(qty: number | string, unit: Unit): string {
  const n = Number(qty);
  const formatted = n % 1 === 0 ? n.toString() : n.toFixed(3).replace(/\.?0+$/, '');
  return `${formatted} ${unit}`;
}
