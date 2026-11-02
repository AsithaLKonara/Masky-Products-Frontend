// Configuration flags for optional / deferred features
// Setting ENABLE_POS to false completely disables POS routes and sidebar entries without deleting code.
// Setting ENABLE_MULTI_BRANCH to false hides multi-branch administrative management while keeping
// branch association for e-commerce website orders.

export const FEATURES = {
  ENABLE_POS: process.env.NEXT_PUBLIC_ENABLE_POS === "true",
  ENABLE_MULTI_BRANCH: process.env.NEXT_PUBLIC_ENABLE_MULTI_BRANCH === "true",
} as const;
