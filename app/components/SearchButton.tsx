"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../shared";
import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const SearchButton = () => {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  const handleImageClick = () => {
    const imageInput = document.getElementById("imageInput");
    if (imageInput) {
      imageInput.click();
    }
  };

  const handleSearch = () => {
    if (!url) return;
    router.push(`/search?query=${encodeURIComponent(url)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const authenticator = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/imagekitauth`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Authentication failed:", error);
      return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-6">
      {/* Logo */}
      <div className="text-center">
        <Image
          src="/assets/sementech-logo.png"
          alt="Sementech Logo"
          width={300}
          height={300}
          priority
          className="mx-auto w-[200px] sm:w-[300px] h-auto"
        />
        <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-10 px-4">
          Encontre as melhores sementes para o seu cultivo
        </p>
      </div>

      {/* Search Container */}
      <div className="w-full max-w-3xl relative">
        {/* Search Bar */}
        <div className="relative bg-white shadow-lg rounded-2xl p-2 border border-gray-200">
          <div className="flex items-center gap-2">
            {/* URL Input */}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar por sementes, plantas ou culturas..."
              className="flex-1 bg-transparent px-4 sm:px-6 py-3 text-gray-800 placeholder-gray-400 text-base sm:text-lg focus:outline-none"
            />

            {/* Image Upload and Search Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleImageClick}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                title="Enviar imagem de planta para identificação"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <ImageKitProvider
                  publicKey={publicKey}
                  urlEndpoint={urlEndpoint}
                  authenticator={authenticator}
                >
                  <IKUpload
                    id="imageInput"
                    className="hidden"
                    fileName="upload.png"
                    onError={(err) => console.log("Error", err)}
                    onSuccess={(res) => router.push("/" + res.url)}
                  />
                </ImageKitProvider>
              </button>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="p-3 rounded-xl bg-gradient-to-r from-[#7ECD2C] to-[#9BDE5A] hover:from-[#6CB925] hover:to-[#8AC94D] transition-all shadow-sm hover:shadow-md"
                title="Buscar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Example Searches */}
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
          Buscas populares
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Manjericão", "Tomate", "Alface", "Melancia", "Cenoura"].map(
            (item) => (
              <button
                key={item}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#E8F5D6] hover:bg-[#D5EBBA] text-[#4A7A1A] text-xs sm:text-sm transition-colors"
                onClick={() =>
                  router.push(`/search?query=${encodeURIComponent(item)}`)
                }
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchButton;
