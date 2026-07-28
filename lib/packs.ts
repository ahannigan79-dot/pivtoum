/** The three packs. Pay first, choose after — no cart, no pre-selection. */
export interface Pack {
  size: number;
  label: string;
  price: string;
  priceCents: number;
  tag?: string;
}

export const PACKS: Pack[] = [
  { size: 1, label: "1 profile", price: "$19", priceCents: 1900 },
  { size: 3, label: "3 profiles", price: "$29", priceCents: 2900 },
  { size: 5, label: "5 profiles", price: "$39", priceCents: 3900, tag: "Most families" },
];

export function getPack(size: number): Pack | undefined {
  return PACKS.find((p) => p.size === size);
}
