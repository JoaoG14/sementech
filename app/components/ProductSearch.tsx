"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import WhatsappForm from "./WhatsappForm";
import ShareBanner from "./ShareBanner";
import Spinner from "./Spinner";

// Import new components
import PreSearch from "./PreSearch";
import ProductDetails from "./ProductDetails";
import OffersDisplay from "./OffersDisplay";

// Import utilities
import {
  updateElementDisplay,
  updateElementInnerHTML,
  formatUrl,
} from "../utils/formatters";
import { isSourceDomainVerified } from "../utils/storeVerification";
import {
  registerSearch,
  getProductOffers,
  getPreSearchData,
  checkExistingSearch,
} from "../services/productService";
import { apiBaseUrl } from "../shared";
import posthog from "posthog-js";

// Create a singleton Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProductSearch = () => {
  const [searchId] = useState(() => uuidv4());
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productUrl = pathname.slice(1) + "?" + searchParams;
  const [temp, setTemp]: any = useState("");
  const [ourPick, setOurPick]: any = useState("");
  const [offersData, setOffersData]: any = useState("");
  const [mildlySimilarOffers, setMildlySimilarOffers]: any = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productImg, setProductImg] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productSource, setProductSource] = useState("");
  const [productId, setProductId]: any = useState();
  const [isTextSearch, setIsTextSearch]: any = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [error, setError] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [showPreSearch, setShowPreSearch] = useState(false);
  const [preSearchData, setPreSearchData] = useState<any>(null);
  const [preSearchProgress, setPreSearchProgress] = useState(0);
  const scrollPositionRef = useRef(0);

  let imageUrl: any;
  let searchTitle: any;
  let tempMildlySimilarOffers = [];
  let filteredOffers = [];
  let offerToRemove = 999;

  // Add useEffect to prevent scrolling when pre-search is shown
  useEffect(() => {
    if (showPreSearch) {
      // Save the current scroll position
      scrollPositionRef.current = window.scrollY;

      // Prevent scrolling
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPositionRef.current}px`;
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";

      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [showPreSearch]);

  let progressCounter = 20;

  useEffect(() => {
    const progressBar: any = document?.querySelector("#progressBar");
    if (!progressBar) return;

    const interval = setInterval(() => {
      if (progressCounter < 100) {
        if (progressCounter === 53) {
          progressCounter += 17;
        } else {
          progressCounter++;
        }
        progressBar.style.width = `${progressCounter}%`;
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollPositionRef.current) {
      // Restore the scroll position after the component has re-rendered
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, []);

  // Add a useEffect for the pre-search progress bar
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (showPreSearch && isLoading) {
      // Start at 0% and gradually increase to 95% (leaving room for completion)
      setPreSearchProgress(0);

      progressInterval = setInterval(() => {
        setPreSearchProgress((prevProgress) => {
          // Increase faster at the beginning, slower as we approach 95%
          const increment = Math.max(1, 10 * (1 - prevProgress / 95));
          const newProgress = Math.min(95, prevProgress + increment);
          return newProgress;
        });
      }, 800);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [showPreSearch, isLoading]);

  useEffect(() => {
    // Check if the search parameter is "from-home"
    const search = searchParams.get("search");

    // Show error message if search param is "error"
    if (search === "error") {
      setIsLoading(false);
      setError(true);
      updateElementDisplay("loadingSpinner", "none");
      updateElementDisplay("tooMuchTraffic", "block");
      return; // Skip the rest of the function
    }

    if (search === "show-results") {
      // Use data from URL parameters instead of calling the API
      setIsLoading(false);
      setError(false);

      // Get product data from URL parameters
      const productImageParam = searchParams.get("product-image") || "";
      const productPriceParam = searchParams.get("product-price") || "";
      const productSourceParam = searchParams.get("product-source") || "";
      const productTitleParam = searchParams.get("product-title") || "";

      // Set product data from URL parameters
      setProductImg(productImageParam);
      setProductTitle(productTitleParam);
      setProductSource(productSourceParam);
      setProductPrice(productPriceParam);

      // Update UI elements
      updateElementDisplay("loadingSpinner", "none");
      updateElementDisplay("productTag", "block");

      if (productTitleParam === "imagem") {
        updateElementDisplay("productDescription", "none");
      }

      // Get the domain from pathname and check if it's verified
      const domain = pathname.split("/")[2];
      updateElementDisplay(
        "checkmark",
        domain && isSourceDomainVerified(domain) ? "inline" : "none"
      );
      updateElementDisplay(
        "sourceContainer",
        productSourceParam ? "block" : "flex"
      );

      // Set image URL and search title for offer search
      imageUrl = productImageParam;
      searchTitle = productTitleParam;

      if (!imageUrl) {
        updateElementDisplay("productDetails", "none");
        setIsTextSearch(true);
      }

      // Fetch offers using the product data from URL parameters
      const fetchProductOffers = async () => {
        try {
          const location = "BR";
          setOffersLoading(true);
          const getOffersData = await getProductOffers(
            imageUrl,
            searchTitle,
            location
          );

          if (!getOffersData) {
            throw new Error("Failed to fetch offers");
          }

          tempMildlySimilarOffers = await getOffersData[2];
          filteredOffers = await getOffersData[1];
          let ourPickOffer = await getOffersData[0];
          let allOffers = await getOffersData[3];

          // Register the search with data from URL parameters
          if (
            getOffersData[1].length > 5 &&
            productTitleParam &&
            productImageParam &&
            !isNaN(Number(productPriceParam))
          ) {
            const searchData = {
              searchId,
              productUrl: pathname.slice(1) + "?" + searchParams,
              img: productImageParam,
              title: productTitleParam,
              price: productPriceParam,
              source: productSourceParam,
              offers: [
                getOffersData[0] || [],
                getOffersData[1] || [],
                getOffersData[2] || [],
                getOffersData[3] || [],
              ],
              cache: true,
            };
            await registerSearch(searchData);
          } else if (
            getOffersData[0].length > 0 ||
            getOffersData[1].length > 0 ||
            getOffersData[2].length > 0 ||
            getOffersData[3].length > 0
          ) {
            const searchData = {
              searchId,
              productUrl: pathname.slice(1) + "?" + searchParams,
              img: productImageParam,
              title: productTitleParam,
              price: productPriceParam,
              source: productSourceParam,
              offers: [
                getOffersData[0] || [],
                getOffersData[1] || [],
                getOffersData[2] || [],
                getOffersData[3] || [],
              ],
              cache: false,
            };
            await registerSearch(searchData);
          }

          setOurPick(ourPickOffer);

          const combinedOffers = [
            ...filteredOffers,
            ...tempMildlySimilarOffers,
          ];
          setOffersData(combinedOffers);
          setMildlySimilarOffers([]);

          updateElementDisplay("resultsTitle", "block");
          updateElementDisplay("imagePromo", "block");
          updateElementDisplay("offersNotGood", "block");
          updateElementDisplay("tooMuchTraffic2", "none");
          updateElementDisplay("shareBanner", "block");
          setOffersLoading(false);
        } catch (error) {
          console.error("Error fetching offers:", error);
          updateElementDisplay("loadingSpinner2", "none");
          updateElementDisplay("tooMuchTraffic2", "block");
          setOffersLoading(false);
        }
      };

      fetchProductOffers();
      return; // Skip the main product info fetch
    } else if (search !== "from-home" && typeof window !== "undefined") {
      // Only show pre-search if search is NOT "from-home"
      setShowPreSearch(true);

      // Get product info for pre-search page
      const fetchPreSearchData = async () => {
        try {
          const data = await getPreSearchData(productUrl);
          if (!data) {
            throw new Error("Failed to fetch pre-search data");
          }

          setPreSearchData(data);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching pre-search data:", error);
          setError(true);
          setIsLoading(false);
          window.location.href =
            "/" + productUrl.split("?")[0] + "?search=error";
        }
      };

      fetchPreSearchData();
      return; // Skip the main product info fetch
    }

    const fetchProductInfo = async () => {
      try {
        setIsLoading(true);
        setError(false);
        let urlToSearch = productUrl.split("?")[0];
        let formattedProductUrl = formatUrl(productUrl);

        // Check for existing search
        const existingSearch = await checkExistingSearch(urlToSearch);
        if (existingSearch) {
          router.push("/p/" + existingSearch.id);
          return;
        }

        // Check if this is a text search by looking at the pathname structure
        const brazilianDomains = [
          ".com.br",
          ".org.br",
          ".net.br",
          ".gov.br",
          ".edu.br",
          ".shop.br",
        ];
        const hasBrazilianDomain = brazilianDomains.some((domain) =>
          pathname.includes(domain)
        );
        const hasCommonDomain =
          pathname.includes(".com") ||
          pathname.includes(".net") ||
          pathname.includes(".org") ||
          pathname.includes(".shop") ||
          pathname.includes(".io") ||
          pathname.includes(".app");

        // If the pathname contains a domain (like taniabulhoes.com.br), it's a URL, not a text search
        const isTextSearch =
          !hasBrazilianDomain &&
          !hasCommonDomain &&
          !pathname.includes("www.") &&
          !pathname.includes("http");
        setIsTextSearch(isTextSearch);

        if (isTextSearch) {
          // Skip scraping and go directly to search
          updateElementDisplay("loadingSpinner", "none");
          updateElementDisplay("productTag", "block");

          try {
            setOffersLoading(true);
            posthog.capture("searchandcompare_api_call");
            const getOffers = await fetch(
              `${apiBaseUrl}/api/searchandcompare`,
              {
                method: "POST",
                body: JSON.stringify({ searchTitle: urlToSearch }),
              }
            );

            let getOffersData = await getOffers.json();
            console.log("Text search API response:", getOffersData);
            let allOffers = Array.isArray(getOffersData[3])
              ? getOffersData[3]
              : [];
            console.log("Processed offers for display:", allOffers);

            setOffersData(allOffers);

            updateElementDisplay("resultsTitle", "block");
            updateElementDisplay("imagePromo", "block");
            updateElementDisplay("offersNotGood", "block");
            updateElementDisplay("tooMuchTraffic2", "none");
            updateElementDisplay("shareBanner", "block");
            setOffersLoading(false);

            // Register the search
            if (allOffers?.length > 0) {
              const searchData = {
                searchId,
                productUrl: urlToSearch,
                img: "",
                title: urlToSearch,
                price: "",
                source: "",
                offers: [[], [], [], allOffers],
                cache: false,
              };
              await registerSearch(searchData);
            }
          } catch (error) {
            console.error("Error fetching offers:", error);
            updateElementDisplay("loadingSpinner2", "none");
            updateElementDisplay("tooMuchTraffic2", "block");
            setOffersLoading(false);
          }
          return;
        }

        const res = await fetch(`${apiBaseUrl}/api/webscraper`, {
          method: "POST",
          body: JSON.stringify({ productUrl: formattedProductUrl }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch product data");
        }

        const productData = await res.json();
        setProductData(productData);

        if (!productData.title) {
          setError(true);
          updateElementDisplay("loadingSpinner", "none");
          updateElementDisplay("tooMuchTraffic", "block");
          return;
        }

        updateElementDisplay("loadingSpinner", "none");
        updateElementDisplay("productTag", "block");

        if (productData.title === "imagem") {
          updateElementDisplay("productDescription", "none");
        }

        setProductSource(productData.source);
        setProductImg(productData.img);
        setProductTitle(productData.title);
        setProductPrice(productData.price);

        // Get the domain from pathname and check if it's verified
        const domain = pathname.split("/")[2];
        updateElementDisplay(
          "checkmark",
          domain && isSourceDomainVerified(domain) ? "inline" : "none"
        );
        updateElementDisplay(
          "sourceContainer",
          productData.source ? "block" : "flex"
        );

        imageUrl = productData.img || "";
        searchTitle = productData.title;

        if (!imageUrl) {
          updateElementDisplay("productDetails", "none");
          setIsTextSearch(true);
        }

        try {
          const location = "BR";
          setOffersLoading(true);
          const getOffersData = await getProductOffers(
            imageUrl,
            searchTitle,
            location
          );

          if (!getOffersData) {
            throw new Error("Failed to fetch offers");
          }

          tempMildlySimilarOffers = await getOffersData[2];
          filteredOffers = await getOffersData[1];
          let ourPickOffer = await getOffersData[0];
          let allOffers = await getOffersData[3];

          // check if there is product info and there is enough offers to cache the search
          if (
            getOffersData[1].length > 5 &&
            productData.title &&
            productData.img &&
            !isNaN(productData.price)
          ) {
            const searchData = {
              searchId,
              productUrl: urlToSearch,
              img: productData.img,
              title: productData.title,
              price: productData.price,
              source: productData.source,
              offers: [
                getOffersData[0] || [],
                getOffersData[1] || [],
                getOffersData[2] || [],
                getOffersData[3] || [],
              ],
              cache: true,
            };
            await registerSearch(searchData);
          } else if (
            getOffersData[0].length > 0 ||
            getOffersData[1].length > 0 ||
            getOffersData[2].length > 0 ||
            getOffersData[3].length > 0
          ) {
            const searchData = {
              searchId,
              productUrl: urlToSearch,
              img: productData.img,
              title: productData.title,
              price: productData.price,
              source: productData.source,
              offers: [
                getOffersData[0] || [],
                getOffersData[1] || [],
                getOffersData[2] || [],
                getOffersData[3] || [],
              ],
              cache: false,
            };
            await registerSearch(searchData);
          }

          setOurPick(ourPickOffer);

          const combinedOffers = [
            ...filteredOffers,
            ...tempMildlySimilarOffers,
          ];
          setOffersData(combinedOffers);
          setMildlySimilarOffers([]);

          updateElementDisplay("resultsTitle", "block");
          updateElementDisplay("imagePromo", "block");
          updateElementDisplay("offersNotGood", "block");
          updateElementDisplay("tooMuchTraffic2", "none");
          updateElementDisplay("shareBanner", "block");
          setOffersLoading(false);
        } catch (error) {
          console.error("Error fetching offers:", error);
          updateElementDisplay("loadingSpinner2", "none");
          updateElementDisplay("tooMuchTraffic2", "block");
          setOffersLoading(false);
        }
      } catch (error) {
        console.error("Error fetching product info:", error);
        setError(true);
        updateElementDisplay("loadingSpinner", "none");
        updateElementDisplay("tooMuchTraffic", "block");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductInfo();
  }, [productUrl, router, pathname, searchParams, searchId]);

  // Handle showing results from pre-search
  const handleShowResults = (redirectToAmazon: boolean) => {
    // Add the from-home parameter and reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("search", "show-results");

    // Add additional parameters here
    currentUrl.searchParams.set("product-image", preSearchData.img || "");
    currentUrl.searchParams.set("product-title", preSearchData.title || "");
    currentUrl.searchParams.set("product-price", preSearchData.price || "");
    currentUrl.searchParams.set("product-source", preSearchData.source || "");

    // If redirectToAmazon is true, also redirect to Amazon search
    if (redirectToAmazon && preSearchData?.title) {
      // First open the search results in a new tab
      window.open(currentUrl.toString(), "_blank");

      // Then redirect the current tab to Amazon after a short delay
      setTimeout(() => {
        const amazonSearchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(
          preSearchData.title
        )}&s=relevanceblender&qid=1718885029&ds=v1%3A4hAW7qXqcJbxktT5J%2FbzeHTW2SAnCYgvvzaUj19iWO8&linkCode=ll2&tag=pexinxas05f-20&linkId=5dc93f9fe53670c62eb803710ff27075&language=pt_BR&ref_=as_li_ss_tl`;
        window.location.href = amazonSearchUrl;
      }, 500);
    } else {
      // Just navigate to the search results in the current tab
      window.location.href = currentUrl.toString();
    }
  };

  const price = productData?.price
    ? Number(productData.price.replace(".", "").split(",")[0])
    : 0;

  return (
    <div>
      {showPreSearch ? (
        <PreSearch
          preSearchData={preSearchData}
          preSearchProgress={preSearchProgress}
          isLoading={isLoading}
          onShowResults={(redirectToAmazon: boolean) =>
            handleShowResults(redirectToAmazon)
          }
          searchId={""}
        />
      ) : (
        <>
          <div id="loadingSpinner">
            <Spinner
              message="Escaneando o produto..."
              submessage="isso pode demorar um pouco mas vale a pena"
            />
          </div>

          <div id="tooMuchTraffic" className="my-40 hidden">
            <div className="mb-40">
              <Suspense>
                <WhatsappForm searchFailed={true} />
              </Suspense>
            </div>
          </div>

          <div
            id="productTag"
            className="hidden max-w-[500px] w-screen mx-auto font-Mulish"
          >
            <ProductDetails
              productImg={productImg}
              productTitle={productTitle}
              productSource={productSource}
              productPrice={productPrice}
              productUrl={productUrl}
              domain={pathname.split("/")[2]}
              isTextSearch={isTextSearch}
            />

            <OffersDisplay
              offersData={offersData}
              ourPick={ourPick}
              isTextSearch={isTextSearch}
              searchId={searchId}
              originalPrice={price}
              isLoading={offersLoading}
            />
          </div>

          <div id="offersNotGood" className="my-20 hidden">
            <div className="mb-32">
              <Suspense>
                <WhatsappForm searchFailed={false} />
              </Suspense>
            </div>
          </div>
          <div id="tooMuchTraffic2" className="my-20 hidden">
            <div className="mb-32">
              <Suspense>
                <WhatsappForm searchFailed={true} />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSearch;
