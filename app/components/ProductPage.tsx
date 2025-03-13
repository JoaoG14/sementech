"use client";

import React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import checkmark from "../checkmark.png";
import OfferCard from "./OfferCard";
import productNotFoundMessage from "../productNotFound.jpg";
import SearchButton from "./SearchButton";
import { scamStores, verifiedStores } from "../shared";
import Spinner from "./Spinner";

import ShareBanner from "@/app/components/ShareBanner";

const ProductPage = async () => {
  const [productInfo, setProductInfo]: any = useState();
  const [offersData, setOffersData]: any = useState();
  const [sortOption, setSortOption] = useState("recomendado");
  const [isLoading, setIsLoading] = useState(true);
  const productId = usePathname().slice(3);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isTextSearch, setIsTextSearch] = useState(false);

  useEffect(() => {
    console.log(productId);
    const getData = async () => {
      try {
        setIsLoading(true);
        let { data: searches, error }: any = await supabase
          .from("searches")
          .select("*")
          .eq("id", productId);

        setProductInfo(searches[0]);

        // Safely combine offers arrays, handling potential undefined or null values
        const offers = searches[0]?.offers || [];
        const combinedOffers = [
          ...(Array.isArray(offers[0]) ? offers[0] : []),
          ...(Array.isArray(offers[1]) ? offers[1] : []),
          ...(Array.isArray(offers[2]) ? offers[2] : []),
          ...(Array.isArray(offers[3]) ? offers[3] : []),
        ];

        setOffersData(combinedOffers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (productInfo && !productInfo.img) {
      setIsTextSearch(true);
    }
  }, [productInfo]);

  const isStoreVerified = (source: string) => {
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

  const filterScamStores = (offers: any[]) => {
    if (!offers) return [];
    return offers.filter((offer) => {
      // Check if the offer URL includes any scam store domain
      return !scamStores.some((scamDomain: string) =>
        offer?.link?.toLowerCase().includes(scamDomain.toLowerCase())
      );
    });
  };

  // Add sorting function
  const sortOffers = (offers: any[]) => {
    if (!offers) return [];
    if (sortOption === "preco") {
      return [...offers].sort((a, b) => {
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
        const scoreA = a.similarityScore || 0;
        const scoreB = b.similarityScore || 0;
        return scoreB - scoreA; // Higher similarity score first
      });
    }
    return offers; // Default "recomendado" sorting
  };

  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner
            message="Carregando informações do produto..."
            submessage="Isso pode demorar alguns segundos"
            showProgressBar={false}
            progressBarId="progressBar"
          />
        </div>
      ) : productInfo ? (
        <div className="max-w-[500px] w-screen mx-auto font-Mulish mb-20">
          {/* <ShareBanner /> */}
          <div
            id="productDetails"
            className="max-w-[500px] w-screen mb-10 font-Mulish"
          >
            <img id="productImage" className="mx-auto" src={productInfo?.img} />
            <div id="productDescription" className="mb-0">
              <div className="h-[1px] bg-[#C1C1C1]"></div>
              <div id="sourceContainer" className="pt-2">
                <p
                  id="productSource"
                  className="ml-3 lg:ml-[0px] mt-3 inline text-[#959595] font-black"
                >
                  <a href={"/redirect/" + productInfo?.product_url}>
                    {" "}
                    {productInfo?.source}{" "}
                  </a>
                </p>
                {/* <Image
                  src={checkmark}
                  className="mx-2 mb-0.5 w-4 inline"
                  alt="checkmark"
                  id="checkmark"
                /> */}
              </div>
              <h1
                id="productTitle"
                className="text-2xl font-black mx-3 lg:ml-[0px] line-clamp-2"
              >
                <a href={"/redirect/" + productInfo?.product_url}>
                  {productInfo?.title
                    ? JSON.stringify(productInfo?.title)
                    : null}
                </a>
              </h1>
              <a
                href={"/redirect/" + productInfo?.product_url}
                className="hover:bg-[#2c38c5] rounded-md my-2 mb-4 font-mulish inline-block ml-3 lg:ml-[0px] px-3 py-1 text-white text-2xl font-black bg-[#3042FB]"
              >
                <div id="productPrice">
                  {isNaN(productInfo?.price)
                    ? "Ver Produto"
                    : `R$ ${Number(productInfo?.price).toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`}
                </div>
              </a>
              <div className="h-[1px] bg-[#C1C1C1] mb-0"></div>
            </div>
          </div>

          <a
            href="https://amzn.to/4iSYUTg"
            id="imgPrm"
            target="_blank"
            className="w-[90vw] max-w-[500px] mx-auto rounded-lg "
          >
            <Image
              src={
                "https://ik.imagekit.io/pexinxas/pexinxas/Assets/AssociatesNewsletter_Summer.jpg"
              }
              alt="ofertas de verão amazon"
              layout="responsive"
              width={500}
              height={500 / (16 / 9)}
              className="rounded-lg"
            ></Image>
          </a>

          <p className="text-sm text-[#565656] m-2 mt-10">
            {isTextSearch
              ? "* Consulte os respectivos websites para ver os preços e disponibilidade mais recentes. Comissionáveis."
              : "* Não fornecemos avaliações ou comparações sobre a qualidade desses produtos. Consulte os respectivos websites para ver os preços e disponibilidade mais recentes. Comissionáveis."}
          </p>

          <div>
            <h1
              id="resultsTitle"
              className="text-3xl ml-3 lg:ml-[0px] mt-7 mb-3 font-black"
            >
              Ofertas
            </h1>
            <div className="flex gap-2  mb-5 lg:ml-0 ml-3">
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

          {offersData ? (
            sortOffers(filterScamStores(offersData)).map(
              (offer: any, index: number) => {
                const isLocked = index >= (offersData.length * 2) / 3;
                return (
                  <OfferCard
                    key={index}
                    locked={isLocked}
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
                  />
                );
              }
            )
          ) : (
            <div id="loadingSpinner2" className="text-center my-56 mb-56">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-12 h-12 text-transparent animate-spin fill-[#3042FB]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>

                <span className="sr-only">Carregando...</span>
                <p className="text-black mt-5 font-bold text-[16px]">
                  Carregando ofertas...
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
        <div className="text-center">
          <Image
            src={productNotFoundMessage}
            alt="Foi mal, não consegui encontrar o produto que você esta procurando.
               Se quiser pode tentar colar o link do produto na barra de pesquisa abaixo"
            height={500}
            width={500}
            className="rounded-lg mx-auto mt-20 mb-10"
          ></Image>
          <SearchButton />
        </div>
      )}
    </>
  );
};

export default ProductPage;
