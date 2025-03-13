import { verifiedStores, scamStores } from "../shared";

/**
 * Checks if a store is verified based on its source name
 * @param source The store source name
 * @returns boolean indicating if the store is verified
 */
export const isStoreVerified = (source: string) => {
  // Check if source is undefined or null
  if (!source) return false;

  // Check each store in verifiedStores
  for (const [storeUrl, storeInfo] of Object.entries(verifiedStores)) {
    // Check if the source matches any of the store's names
    if (
      (storeInfo as { names: string[]; verified: boolean }).names.some(
        (name: string) => source.toLowerCase().includes(name.toLowerCase())
      )
    ) {
      return (storeInfo as { names: string[]; verified: boolean }).verified;
    }
  }
  return false;
};

/**
 * Checks if a domain is verified
 * @param domain The domain to check
 * @returns boolean indicating if the domain is verified
 */
export const isSourceDomainVerified = (domain: string) => {
  // Check if domain is undefined or null
  if (!domain) return false;

  // Check each store in verifiedStores
  for (const [storeUrl, storeInfo] of Object.entries(verifiedStores)) {
    // Extract the domain from storeUrl and compare with the provided domain
    const storeDomain = storeUrl.toLowerCase();
    if (domain.toLowerCase() === storeDomain) {
      return (storeInfo as { verified: boolean }).verified;
    }
  }
  return false;
};

/**
 * Filters out scam stores from a list of offers
 * @param offers Array of offers to filter
 * @returns Filtered array of offers without scam stores
 */
export const filterScamStores = (offers: any[]) => {
  if (!Array.isArray(offers)) return [];
  return offers.filter((offer) => {
    if (!offer || !offer.link || typeof offer.link !== "string") return false;
    return !scamStores.some((scamDomain: string) => {
      if (!scamDomain) return false;
      return offer.link.toLowerCase().includes(scamDomain.toLowerCase());
    });
  });
};

/**
 * Sorts offers by verified status and price
 * @param offers Array of offers to sort
 * @returns Sorted array of offers
 */
export const sortOffersByVerifiedAndPrice = (offers: any[]) => {
  if (!offers) return [];
  return offers.sort((a, b) => {
    // First compare verified status
    const aVerified = isStoreVerified(a.source) ? 1 : 0;
    const bVerified = isStoreVerified(b.source) ? 1 : 0;

    if (aVerified !== bVerified) {
      return bVerified - aVerified; // Verified stores first
    }

    // If verification status is the same, sort by price
    const aPrice =
      parseFloat(
        a.price
          ?.toString()
          .replace(/[^0-9,]/g, "")
          .replace(",", ".")
      ) || Infinity;
    const bPrice =
      parseFloat(
        b.price
          ?.toString()
          .replace(/[^0-9,]/g, "")
          .replace(",", ".")
      ) || Infinity;
    return aPrice - bPrice;
  });
};
