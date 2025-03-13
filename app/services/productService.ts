import { createClient } from "@supabase/supabase-js";
import { apiBaseUrl } from "../shared";
import { formatUrl } from "../utils/formatters";
import posthog from "posthog-js";
// Create a singleton Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Registers a search in the database
 * @param searchData The search data to register
 * @returns The registered search data or null if there was an error
 */
export const registerSearch = async (searchData: any) => {
  try {
    const { data, error } = await supabase
      .from("searches")
      .insert([
        {
          id: searchData.searchId,
          product_url: searchData.productUrl,
          img: searchData.img,
          title: searchData.title,
          price: searchData.price,
          source: searchData.source,
          offers: searchData.offers,
          cache: searchData.cache,
        },
      ])
      .select();

    if (error) {
      console.error("Error registering search:", error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Error in registerSearch:", error);
    return null;
  }
};

/**
 * Fetches product offers from the API
 * @param imageUrl The image URL of the product
 * @param searchTitle The search title of the product
 * @returns The offers data or null if there was an error
 */
export const getProductOffers = async (
  imageUrl: string,
  searchTitle: string,
  location: string
) => {
  try {
    posthog.capture("searchandcompare_api_call");
    const getOffers = await fetch(`${apiBaseUrl}/api/searchandcompare`, {
      method: "POST",
      body: JSON.stringify({ imageUrl, searchTitle, location }),
    });

    return await getOffers.json();
  } catch (error) {
    console.error("Error fetching offers:", error);
    return null;
  }
};

/**
 * Fetches pre-search data from the API
 * @param productUrl The product URL
 * @returns The pre-search data or null if there was an error
 */
export const getPreSearchData = async (productUrl: string) => {
  try {
    let urlToSearch = productUrl.split("?")[0];
    let formattedProductUrl = formatUrl(productUrl);

    if (!formattedProductUrl.includes("http")) {
      const brazilianDomains = [
        ".com.br",
        ".org.br",
        ".net.br",
        ".gov.br",
        ".edu.br",
        ".shop.br",
      ];
      const startsWithWww = formattedProductUrl.startsWith("www.");
      const hasBrazilianDomain = brazilianDomains.some((domain) =>
        formattedProductUrl.includes(domain)
      );

      if (startsWithWww) {
        formattedProductUrl = "https://" + formattedProductUrl;
      } else if (hasBrazilianDomain) {
        formattedProductUrl = "https://www." + formattedProductUrl;
      }

      if (startsWithWww || hasBrazilianDomain) {
        urlToSearch = formattedProductUrl.split("?")[0];
      }
    }

    const res = await fetch(`${apiBaseUrl}/api/webscraper`, {
      method: "POST",
      body: JSON.stringify({ productUrl: formattedProductUrl }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch product data");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching pre-search data:", error);
    return null;
  }
};

/**
 * Checks if a search exists in the database
 * @param productUrl The product URL
 * @returns The existing search data or null if it doesn't exist
 */
export const checkExistingSearch = async (productUrl: string) => {
  try {
    // Calculate date 3 days ago in ISO format for timestamptz compatibility
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString();

    // Query recent searches using timestamptz comparison
    const { data: existingSearch, error } = await supabase
      .from("searches")
      .select("*")
      .gte("created_at", threeDaysAgoISO)
      .eq("product_url", productUrl)
      .eq("cache", true)
      .single();

    if (error) {
      return null;
    }

    return existingSearch;
  } catch (error) {
    console.error("Error checking existing search:", error);
    return null;
  }
};
