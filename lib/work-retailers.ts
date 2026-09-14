// Verified public catalog entries. Update product IDs here, not in page components.
export const retailers = {
  bottling: {
    name: "보틀링컴퍼니",
    productBaseUrl: "https://smartstore.naver.com/bottlingcp/products/",
    actionLabel: "네이버 스마트스토어에서 구매 ↗",
  },
} as const;
type RetailerId = keyof typeof retailers;
type Listing = { retailerId: RetailerId; productId: string };
export const retailListings = {
  "snake-carnival": { retailerId: "bottling", productId: "13022099038" },
  "red-lab": { retailerId: "bottling", productId: "13760314372" },
  "gourmet-master": { retailerId: "bottling", productId: "13760317500" },
  "too-many-doctors": { retailerId: "bottling", productId: "13760322257" },
} satisfies Record<string, Listing>;
type WorkRetailer = { url: string; seller: string; actionLabel: string };
export const workRetailers: Record<string, WorkRetailer> = Object.fromEntries(
  Object.entries(retailListings).map(([slug, listing]) => {
    const retailer = retailers[listing.retailerId];
    return [
      slug,
      {
        url: retailer.productBaseUrl + listing.productId,
        seller: retailer.name,
        actionLabel: retailer.actionLabel,
      },
    ];
  }),
);
export function getWorkRetailer(slug: string): WorkRetailer | undefined {
  return Object.hasOwn(workRetailers, slug) ? workRetailers[slug] : undefined;
}
