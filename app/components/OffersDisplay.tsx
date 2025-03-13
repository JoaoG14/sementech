"use client";

import React, { useState } from "react";
import Image from "next/image";
import OfferCard from "./OfferCard";
import OurPick from "./OurPick";
import TextSearchCard from "./TextSearchCard";
import Spinner from "./Spinner";
import { filterScamStores } from "../utils/storeVerification";
import { isStoreVerified } from "../utils/storeVerification";

interface OffersDisplayProps {
  offersData: any[];
  ourPick: any[];
  isTextSearch: boolean;
  searchId: string;
  originalPrice?: number;
  isLoading: boolean;
}

const OffersDisplay: React.FC<OffersDisplayProps> = ({
  offersData,
  ourPick,
  isTextSearch,
  searchId,
  originalPrice = 0,
  isLoading,
}) => {
  const [sortOption, setSortOption] = useState("recomendado");

  // Sort offers based on the selected option
  const sortOffers = (offers: any[]) => {
    if (!Array.isArray(offers)) return [];
    if (sortOption === "preco") {
      return [...offers].sort((a, b) => {
        if (!a || !b) return 0;
        const priceA =
          typeof a.price === "string"
            ? parseFloat(a.price.replace(/[^0-9,]/g, "").replace(",", "."))
            : Number(a.price);
        const priceB =
          typeof b.price === "string"
            ? parseFloat(b.price.replace(/[^0-9,]/g, "").replace(",", "."))
            : Number(b.price);
        return priceA - priceB;
      });
    } else if (sortOption === "similaridade" && !isTextSearch) {
      return [...offers].sort((a, b) => {
        if (!a || !b) return 0;
        const scoreA = a.similarityScore || 0;
        const scoreB = b.similarityScore || 0;
        return scoreB - scoreA; // Higher similarity score first
      });
    }
    return offers;
  };

  // Show spinner when loading or when offersData is not available
  if (isLoading || !offersData) {
    return (
      <div id="loadingSpinner2">
        <Spinner
          message="Procurando por ofertas..."
          submessage="Isso pode demorar alguns segundos mas vai te economizar alguns reais."
          showProgressBar={true}
          progressBarId="progressBar"
          useRotatingMessages={true}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <a
          href="https://amzn.to/3Q3GmCA"
          id="imgPrm"
          target="_blank"
          className="w-[90vw] max-w-[500px] mx-auto rounded-lg mt-7"
        >
          <Image
            src={
              "https://ik.imagekit.io/pexinxas/pexinxas/Assets/iPhone16PrimeExclusiveDeal.png?updatedAt=1738589530251"
            }
            alt="ofertas de verão na amazon"
            height={500}
            width={500}
            className="rounded-lg"
          ></Image>
        </a>
      </div>

      <p className="text-sm text-[#565656] m-2">
        {isTextSearch
          ? "* Consulte os respectivos websites para ver os preços e disponibilidade mais recentes. Comissionáveis."
          : "* Não fornecemos avaliações ou comparações sobre a qualidade desses produtos. Consulte os respectivos websites para ver os preços e disponibilidade mais recentes. Comissionáveis."}
      </p>

      <div>
        <h1
          id="resultsTitle"
          className="text-3xl ml-3 lg:ml-[0px] mt-7 mb-3 font-black"
        >
          Resultados
        </h1>
        <div className="flex gap-2 mb-5 sm:ml-0 ml-3">
          <button
            onClick={() => setSortOption("recomendado")}
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              sortOption === "recomendado"
                ? "bg-[#3042FB] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Recomendado
          </button>
          <button
            onClick={() => setSortOption("preco")}
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              sortOption === "preco"
                ? "bg-[#3042FB] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Preço
          </button>
          {!isTextSearch && (
            <button
              onClick={() => setSortOption("similaridade")}
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                sortOption === "similaridade"
                  ? "bg-[#3042FB] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Similaridade
            </button>
          )}
        </div>
      </div>

      {isTextSearch ? (
        <div className="grid grid-cols-2 gap-2 mx-auto px-2 w-full max-w-[1200px] mb-32">
          {Array.isArray(offersData) ? (
            sortOffers(offersData).map((product: any) => {
              if (!product) return null;
              return (
                <TextSearchCard
                  key={product.id || Math.random()}
                  productInfo={{
                    thumbnail: product.thumbnail,
                    source: product.source,
                    title: product.title,
                    price: product.price,
                    url: product.link,
                  }}
                />
              );
            })
          ) : (
            <div
              id="loadingSpinner2"
              className="text-center my-56 mb-56 col-span-2"
            >
              <div role="status">
                <div className="ispinner ispinner-large mx-auto">
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                  <div className="ispinner-blade"></div>
                </div>

                <div className="w-[80%] text-center mx-auto mb-4 mt-14 max-w-[360px] bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    id="progressBar"
                    className="bg-[#3042FB] h-2 rounded-full w-0 transition-all ease-in-out duration-1000"
                  ></div>
                </div>

                <span className="sr-only">Loading...</span>
                <p className="text-black mt-5 font-bold text-[16px]">
                  Procurando por ofertas...
                </p>
                <p className="text-[14px] w-[300px] mx-auto text-center">
                  Isso pode demorar alguns segundos mas vai te economizar alguns
                  reais.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {ourPick.length > 0 ? (
            <div className="w-[96vw] mx-auto max-w-[500px]">
              <div className="font-extrabold px-4 py-1 rounded-t-[10px] text-white inline-block bg-[#3042fb]">
                Recomendações
              </div>
              <p className="hidden text-xs text-zinc-600 p-4">comissionáveis</p>
              <div className="border-[#3042fb] border-[4px] rounded-r-[10px] rounded-bl-[10px] mb-2">
                {ourPick
                  ? filterScamStores(ourPick).map(
                      (offer: any, index: number) => {
                        return (
                          <OurPick
                            key={index}
                            offersInfo={{
                              position: offer?.position,
                              thumbnail: offer?.thumbnail,
                              source_icon: offer?.source_icon,
                              source: offer?.source,
                              title: offer?.title,
                              price: offer?.price,
                              link: offer?.link,
                            }}
                          />
                        );
                      }
                    )
                  : null}
              </div>
            </div>
          ) : null}

          {sortOffers(filterScamStores(offersData)).map(
            (offer: any, index: number) => {
              if (
                offer?.price < originalPrice / 10 &&
                !isStoreVerified(offer.source)
              ) {
                return null;
              }
              return (
                <OfferCard
                  key={index}
                  offersInfo={{
                    position: offer?.position,
                    thumbnail: offer?.thumbnail,
                    source_icon: offer?.source_icon,
                    source: offer?.source,
                    title: offer?.title,
                    price: offer?.price,
                    link: offer?.link,
                  }}
                  verified={isStoreVerified(offer.source)}
                  searchId={searchId}
                />
              );
            }
          )}
        </div>
      )}
    </>
  );
};

export default OffersDisplay;
