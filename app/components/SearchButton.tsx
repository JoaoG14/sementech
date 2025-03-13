"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../shared";
import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const SearchButton = () => {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const [isDeepSearch, setIsDeepSearch] = useState(false);

  const handleImageClick = () => {
    const imageInput = document.getElementById("imageInput");
    if (imageInput) {
      imageInput.click();
    }
  };

  const handleSearch = () => {
    if (!url) return;
    router.push(`/${url.split("?")[0]}?search_from=home&deep=${isDeepSearch}`);
  };

  const authenticator = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/imagekitauth`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Authentication failed:", error);
      return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-10">
      {/* Logo */}
      <div className="mb-4 text-center">
        <h1 className="text-6xl font-bold text-green-800 mb-2" style={{ fontFamily: 'system-ui' }}>Sementech</h1>
        <p className="text-xl text-gray-600">Encontre as melhores sementes para o seu cultivo</p>
      </div>

      {/* Search Container */}
      <div className="w-full max-w-3xl relative">
        {/* Glow Effects */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#86EFAC] to-[#4ADE80] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
        
        {/* Search Bar */}
        <div className="relative bg-white shadow-lg rounded-2xl p-2 border border-gray-200">
          <div className="flex items-center gap-2">
            {/* URL Input */}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Buscar por sementes, plantas ou culturas..."
              className="flex-1 bg-transparent px-6 py-3 text-gray-800 placeholder-gray-400 text-lg focus:outline-none"
            />

            {/* Image Upload */}
            <div className="flex items-center gap-2 px-2">
              <button
                onClick={handleImageClick}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                title="Enviar imagem de planta para identificação"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                className="p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 transition-all shadow-sm hover:shadow-md"
                title="Buscar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Deep Search Toggle */}
          <div className="px-6 py-2 flex items-center gap-2 border-t border-gray-200 mt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDeepSearch}
                onChange={(e) => setIsDeepSearch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ADE80]"></div>
            </label>
            <span className="text-gray-600 text-sm">Busca avançada</span>
          </div>
        </div>
      </div>

      {/* Example Searches */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm mb-4">Buscas populares</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Hortaliças", "Orgânicas", "Flores", "Frutíferas"].map((item) => (
            <button
              key={item}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              onClick={() => setUrl(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchButton;
