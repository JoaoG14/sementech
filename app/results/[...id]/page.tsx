"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";
import NavBar from "@/app/components/NavBar";
import OfferCard from "@/app/components/OfferCard";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import WhatsappForm from "@/app/components/WhatsappForm";
import Recommended from "@/app/components/Recommended";
import Spinner from "@/app/components/Spinner";
import { supabase } from "@/app/utils/supabase";
import { getSortedOffers } from "@/app/shared";

const Results = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const [offersData, setOffersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [sortMethod, setSortMethod] = useState("recommended");

  const [image, setImage] = useState(searchParams.get("image") || "");
  const [name, setName] = useState(searchParams.get("name") || "");
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [price, setPrice] = useState(searchParams.get("price") || "");
  const [source, setSource] = useState(searchParams.get("source") || "");
  const id = Array.isArray(params.id) ? params.id.join("/") : params.id || "";

  // Extract domain from URL for verification
  const domain = url ? new URL(decodeURIComponent(url)).hostname : "";

  const checkCache = async () => {
    try {
      const { data, error } = await supabase
        .from("searches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error checking cache:", error);
        return false;
      }

      if (data) {
        // Update all the states with cached data
        setImage(data.img);
        setName(data.title);
        setUrl(data.product_url);
        setPrice(data.price);
        setSource(data.source);
        setOffersData(data.offers);
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking cache:", error);
      return false;
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`/api/productsearch?image=${image}`, {
        next: { revalidate: 259200 },
      });

      if (response.status === 200) {
        const data = await response.json();
        setOffersData(data.results);

        // Save successful search to Supabase
        const { error: supabaseError } = await supabase
          .from("searches")
          .insert({
            id: id,
            product_url: decodeURIComponent(url),
            img: decodeURIComponent(image),
            title: decodeURIComponent(name),
            price: decodeURIComponent(price),
            source: decodeURIComponent(source),
            offers: data.results,
            cache: true,
          });

        if (supabaseError) {
          console.error("Error saving search to Supabase:", supabaseError);
        }
      } else {
        throw new Error("Request failed with status code: " + response.status);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error making the request:", axiosError.message);
      setError(
        "Não foi possível carregar as ofertas. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const isCached = await checkCache();
      if (!isCached && image) {
        await fetchOffers();
      }
    };

    initializeData();
  }, [id]); // Changed dependency to id instead of image

  return (
    <>
      <NavBar />
      <div className="w-[96vw] max-w-[500px] mx-auto">
        <ProductDetails
          productImg={decodeURIComponent(image)}
          productTitle={decodeURIComponent(name)}
          productUrl={decodeURIComponent(url)}
          productPrice={decodeURIComponent(price)}
          productSource={decodeURIComponent(source)}
          domain={domain}
          isTextSearch={false}
        />
      </div>

      {isLoading ? (
        <div className="text-center">
          <Spinner
            message="Procurando por ofertas..."
            submessage="Isso pode demorar alguns segundos mas vai te economizar alguns reais."
            showProgressBar={true}
            progressBarId="progressBar"
            useRotatingMessages={true}
          />
        </div>
      ) : error ? (
        <div className="w-[96vw] mx-auto">
          <div className="text-center my-20 py-8">
            <WhatsappForm searchFailed={true} />
          </div>
          <Recommended />
        </div>
      ) : (
        <>
          <div className="w-[96vw] mx-auto max-w-[500px]">
            <div className="my-5">
              <a
                href="https://s.shopee.com.br/5VH80DDW6j"
                id="imgPrm"
                target="_blank"
                className="w-[96vw] max-w-[500px] mx-auto rounded-lg "
              >
                <Image
                  src={"https://ik.imagekit.io/pexinxas/shopee-house-03-25.png"}
                  alt="ofertas para casa na shopee"
                  height={500}
                  width={500}
                  className="rounded-lg"
                ></Image>
              </a>
            </div>

            <p className="text-sm text-[#565656] m-2">
              * Não fornecemos avaliações ou comparações sobre a qualidade
              desses produtos. Consulte os respectivos websites para ver os
              preços e disponibilidade mais recentes. Comissionáveis.
            </p>

            <h3 className="text-2xl mx-2 font-[1000]">Resultados</h3>

            {/* Sorting buttons */}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setSortMethod("recommended")}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold ${
                  sortMethod === "recommended"
                    ? "bg-[#3042FB] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Recomendados
              </button>
              <button
                onClick={() => setSortMethod("price")}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold ${
                  sortMethod === "price"
                    ? "bg-[#3042FB] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Menor Preço
              </button>
            </div>

            <div className="mt-4">
              {getSortedOffers(offersData, sortMethod).map(
                (offer: any, index: number) => {
                  if (offer.price && index > 0) {
                    return (
                      <OfferCard
                        key={index}
                        offersInfo={{
                          position: index + 1,
                          thumbnail: offer.url_thumbnail || "",
                          source_icon: "",
                          source: offer.domain || "",
                          title: offer.title || "",
                          price: offer.price.replace("*", "") || "",
                          link: offer.url || "",
                        }}
                        verified={false}
                      />
                    );
                  }
                }
              )}
              {showMore &&
                offersData.map((offer: any, index: number) => {
                  if (!offer.price && offer.url) {
                    return (
                      <OfferCard
                        key={index}
                        offersInfo={{
                          position: index + 1,
                          thumbnail: offer.url_thumbnail || "",
                          source_icon: "",
                          source: offer.domain || "",
                          title: offer.title || "",
                          price: "",
                          link: offer.url || "",
                        }}
                        verified={false}
                      />
                    );
                  }
                })}
            </div>
            {!showMore && (
              <button
                onClick={() => setShowMore(true)}
                className="w-[96vw] mx-auto max-w-[500px] border border-[#6E6E6E] text-black text-center px-4 py-3 rounded-md"
              >
                Ver mais resultados
              </button>
            )}
          </div>

          {/* this is experimental, did not test it yet */}
          <div className="w-[96vw] mx-auto ">
            <div className="text-center my-20 py-8">
              <WhatsappForm searchFailed={false} />
            </div>
            <Recommended />
          </div>
        </>
      )}
    </>
  );
};

export default Results;
