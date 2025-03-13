"use client";

import NavBar from "@/app/components/NavBar";
import TextSearchCard from "@/app/components/TextSearchCard";
import Spinner from "@/app/components/Spinner";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Recommended from "@/app/components/Recommended";
import WhatsappForm from "@/app/components/WhatsappForm";

const SearchResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const params = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const query = Array.isArray(params.query)
          ? params.query.join("/")
          : params.query;

        const response = await fetch("/api/textsearch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control":
              "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
          },
          body: JSON.stringify({
            searchQuery: query,
          }),
          next: { revalidate: 604800 }, // Cache for 7 days (604800 seconds)
        });

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();
        setSearchResults(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching results");
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [params.query]);

  return (
    <div>
      <NavBar />
      {isLoading ? (
        <Spinner
          message="Procurando por ofertas..."
          submessage="Isso pode demorar alguns segundos mas vai te economizar alguns reais."
          showProgressBar={true}
          progressBarId="progressBar"
          useRotatingMessages={true}
        />
      ) : error ? (
        <div className="w-[96vw] mx-auto">
          <div className="text-center my-20 py-8">
            <WhatsappForm searchFailed={true} />
          </div>
          <Recommended />
        </div>
      ) : (
        <>
          <div className="p-2 max-w-[1200px] mx-auto">
            <div className="mb-4 mx-auto items-center justify-center flex">
              <a
                href="https://amzn.to/3Q3GmCA"
                id="imgPrm"
                target="_blank"
                className="w-[96vw] max-w-[500px] mx-auto rounded-lg mt-7"
              >
                <img
                  src={
                    "https://ik.imagekit.io/pexinxas/pexinxas/Assets/iPhone16PrimeExclusiveDeal.png?updatedAt=1738589530251"
                  }
                  alt="ofertas de verão na amazon"
                  height={500}
                  width={500}
                  className="rounded-lg"
                />
              </a>
            </div>

            <p className="text-sm text-[#565656] m-2 max-w-[500px]">
              * Não fornecemos avaliações ou comparações sobre a qualidade
              desses produtos. Consulte os respectivos websites para ver os
              preços e disponibilidade mais recentes. Comissionáveis.
            </p>
            <h1 className="text-2xl font-bold mb-4">Resultados da busca</h1>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 mx-auto w-full max-w-[1200px] mb-20">
              {searchResults.map((product: any, index: number) => {
                if (product.thumbnail) {
                  return (
                    <TextSearchCard
                      key={index}
                      productInfo={{
                        source: product.merchant?.name,
                        url: product.url,
                        title: product.title,
                        price: product.price,
                        thumbnail: product.thumbnail,
                      }}
                    />
                  );
                }
              })}
            </div>
            <Recommended />
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;
