import { claimableCareers } from "@/lib/profiles";

/** The three packs. Pay first, choose after — no cart, no pre-selection.
 *  "Unlimited" grants every career we publish; its size tracks the catalog so
 *  the claim flow always matches what's actually claimable. */
export interface Pack {
  size: number;
  label: string;
  price: string;
  priceCents: number;
  tag?: string;
  unlimited?: boolean;
}

export const PACKS: Pack[] = [
  { size: 1, label: "1 career", price: "$49", priceCents: 4900 },
  { size: 3, label: "3 careers", price: "$69", priceCents: 6900 },
  {
    size: claimableCareers().length,
    label: "Unlimited",
    price: "$99",
    priceCents: 9900,
    tag: "Best value",
    unlimited: true,
  },
];

export function getPack(size: number): Pack | undefined {
  return PACKS.find((p) => p.size === size);
}

/** An order is unlimited if it granted at least the whole claimable catalog. */
export function isUnlimitedSize(size: number): boolean {
  return size >= claimableCareers().length;
}
