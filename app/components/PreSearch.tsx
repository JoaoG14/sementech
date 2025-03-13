"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import chatBubble from "../chatBubble.jpg";
import Spinner from "./Spinner";
import NavBar from "./NavBar";
import { useSearchParams, useRouter } from "next/navigation";
import Recommended from "./Recommended";

interface PreSearchProps {
  preSearchData: any;
  preSearchProgress: number;
  isLoading: boolean;
  onShowResults: (redirectToAmazon: boolean) => void;
  searchId: string;
}

const PreSearch: React.FC<PreSearchProps> = ({
  preSearchData,
  preSearchProgress,
  isLoading,
  onShowResults,
  searchId,
}) => {
  const [redirectToAmazon, setRedirectToAmazon] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isReload = searchParams.get("reload") === "true";

  // Combined useEffect for both scrolling prevention and progress bar update
  useEffect(() => {
    // Update progress bar if loading
    if (isLoading && preSearchProgress > 0) {
      const progressBar = document.getElementById("progressBar");
      if (progressBar) {
        progressBar.style.width = `${preSearchProgress}%`;
      }
    }
  }, [isLoading, preSearchProgress]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-hidden">
        <Spinner
          message="Escaneando o produto..."
          submessage="isso pode demorar um pouco mas vale a pena"
          showProgressBar={true}
          useRotatingMessages={true}
        />
      </div>
    );
  }

  if (!preSearchData) {
    return (
      <div className="bg-white z-50 flex flex-col items-center justify-center overflow-hidden">
        <NavBar />
        <div className="w-full max-w-md mx-auto my-20 text-center">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Image
                src={chatBubble}
                alt="Error message"
                width={600}
                height={200}
                className="w-full max-w-[600px]"
              />
            </div>

            <button
              onClick={() => (window.location.href = "/")}
              className="bg-[#3042FB] w-[90vw] max-w-[350px] m-3 text-white py-3 px-6 rounded-md font-bold"
            >
              Voltar para Home
            </button>
            {!isReload && (
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("reload", "true");
                  window.location.href = url.toString();
                }}
                className="bg-white text-gray-500 border-2 border-gray-400 w-[90vw] max-w-[350px] py-3 px-6 rounded-md font-bold"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        </div>
        <Recommended />
      </div>
    );
  }

  return (
    <div className="bg-white z-50 flex flex-col items-center justify-center lg:justify-normal p-4 overflow-hidden">
      <div className="w-full max-w-md mx-auto text-center overflow-hidden">
        <h1 className="text-4xl text-[#3042FB] lg:mt-[15%] font-[1000] mb-6">
          achar.promo
        </h1>

        {preSearchData.img ? (
          <div className="bg-gray-100 p-4 rounded-lg mb-3">
            <img
              src={preSearchData.img}
              alt={preSearchData.title || "Product image"}
              className="w-full h-auto object-contain max-h-[300px] mx-auto"
            />
          </div>
        ) : null}

        {preSearchData.title &&
          (preSearchData.img ? (
            <div className="mb-3 text-lg text-left font-bold line-clamp-2">
              {preSearchData.title}
            </div>
          ) : (
            <div className="mb-6 text-lg font-bold line-clamp-2">
              Procurando por {preSearchData.title}
            </div>
          ))}

        <button
          onClick={() => {
            onShowResults(redirectToAmazon);
          }}
          className="w-full bg-[#3042FB] text-white py-3 rounded-md font-bold flex items-center justify-center"
        >
          VER RESULTADOS <span className="ml-2">→</span>
        </button>

        <div className="flex items-center mb-4 mt-2 mx-auto w-[90vw] max-w-[750px]">
          <input
            defaultChecked
            id="default-checkbox"
            type="checkbox"
            value=""
            className="w-4 h-4 text-[#3042FB] accent-[#3042FB] bg-gray-100 border-gray-300 rounded-xl cursor-pointer"
            onChange={(e) => setRedirectToAmazon(e.target.checked)}
          />
          <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Procurar na Amazon também
          </label>
        </div>
      </div>
    </div>
  );
};

export default PreSearch;
