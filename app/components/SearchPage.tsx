"use client";

import React, { useEffect, useState } from "react";
import PreSearch from "./PreSearch";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/app/utils/supabase";

const SearchPage = () => {
  const [preSearchData, setPreSearchData] = useState<any>(null);
  const [preSearchProgress, setPreSearchProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productUrl = pathname.slice(1) + "?" + searchParams;
  const router = useRouter();

  useEffect(() => {
    // Generate a unique search ID
    const generatedSearchId = uuidv4();
    setSearchId(generatedSearchId);
    console.log(searchId);

    // Make API call when component mounts
    getProductInfo(generatedSearchId);
  }, []);

  const getProductInfo = async (searchId: string) => {
    try {
      // Check if the product URL already exists in Supabase from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: existingData, error: supabaseError } = await supabase
        .from("searches")
        .select("*")
        .eq("product_url", productUrl)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingData && !supabaseError) {
        // Use existing data from Supabase (guaranteed to be from the last 7 days)
        console.log("Found recent product data in Supabase:", existingData);
        setPreSearchProgress(100);
        setIsLoading(false);
        setPreSearchData({
          img: existingData.img,
          title: existingData.title,
          price: existingData.price,
        });

        // Use the existing search ID instead of the generated one
        setSearchId(existingData.id);
        return;
      }

      // If no existing data found, proceed with API call
      // Simple progress simulation
      const progressInterval = setInterval(() => {
        setPreSearchProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      // Call the webscraper API
      const response = await fetch("/api/webscraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productUrl }),
      });

      clearInterval(progressInterval);
      setPreSearchProgress(100);

      const data = await response.json();
      setPreSearchData(data);

      if (
        searchParams.get("search_from") === "home" ||
        searchParams.get("search_from") === "textsearch"
      ) {
        router.push(
          `/results/${searchId}?image=${encodeURIComponent(
            data.img
          )}&name=${encodeURIComponent(data.title)}&url=${encodeURIComponent(
            productUrl.replace("?search_from=home", "")
          )}&price=${encodeURIComponent(
            data.price
          )}&source=${encodeURIComponent(data.source)}`
        );
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const handleShowResults = (redirectToAmazon: boolean) => {
    // Redirect to results page with the search ID

    if (redirectToAmazon && searchParams.get("search_from") !== "home") {
      window.open(
        `/results/${searchId}?image=${encodeURIComponent(
          preSearchData.img
        )}&name=${encodeURIComponent(
          preSearchData.title
        )}&url=${encodeURIComponent(productUrl)}&price=${encodeURIComponent(
          preSearchData.price
        )}&source=${encodeURIComponent(preSearchData.source)}`,
        "_blank"
      );
      setTimeout(() => {
        window.location.href = "https://www.amazon.com";
      }, 1000);
    } else {
      router.push(
        `/results/${searchId}?image=${encodeURIComponent(
          preSearchData.img
        )}&name=${encodeURIComponent(
          preSearchData.title
        )}&url=${encodeURIComponent(productUrl)}&price=${encodeURIComponent(
          preSearchData.price
        )}&source=${encodeURIComponent(preSearchData.source)}`
      );
    }
  };

  return (
    <PreSearch
      preSearchData={preSearchData}
      preSearchProgress={preSearchProgress}
      isLoading={isLoading}
      onShowResults={handleShowResults}
      searchId={searchId}
    />
  );
};

export default SearchPage;
