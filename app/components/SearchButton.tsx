"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import toast from "react-hot-toast";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const SearchButton = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle text search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle image upload button click
  const handleImageClick = () => {
    const imageInput = document.getElementById("imageInput");
    if (imageInput) {
      imageInput.click();
    }
  };

  // ImageKit authentication
  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekitauth");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Authentication failed:", error);
      setError("Falha na autenticação para upload de imagem");
      return null;
    }
  };

  // Handle successful image upload
  const handleUploadSuccess = async (res: any) => {
    try {
      setIsUploading(false);
      setIsProcessing(true);
      setError(null);

      // Get the uploaded image URL
      const imageUrl = res.url;

      // Call the image comparison API
      const response = await fetch("/api/image-comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.resultId) {
        throw new Error("No result ID returned from API");
      }

      // Show success message
      const matchCount = data.matches.length;
      const goodMatches = data.matches.filter(
        (m: { similarityScore: number }) => m.similarityScore > 0.85
      ).length;

      const message =
        goodMatches > 0
          ? `Encontramos ${goodMatches} boas correspondências!`
          : matchCount > 0
          ? `Encontramos ${matchCount} possíveis correspondências.`
          : "Análise concluída. Redirecionando para os resultados...";

      toast.success(message, { duration: 3000 });

      // Redirect to results page
      router.push(`/search/image-results?id=${data.resultId}`);
    } catch (err) {
      console.error("Error during image comparison:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao processar a comparação de imagem"
      );
      toast.error("Erro ao processar a imagem. Por favor, tente novamente.", {
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle upload error
  const handleUploadError = (err: any) => {
    console.error("Upload error:", err);
    setError("Erro ao enviar a imagem. Por favor, tente novamente.");
    setIsUploading(false);
    toast.error("Falha no upload da imagem. Por favor, tente novamente.", {
      duration: 5000,
    });
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar por sementes, plantas ou culturas..."
              className="flex-1 bg-transparent px-4 sm:px-6 py-3 text-gray-800 placeholder-gray-400 text-base sm:text-lg focus:outline-none"
              disabled={isUploading || isProcessing}
            />
            <div className="flex items-center gap-2">
              {/* Image Upload Button */}
              <button
                onClick={handleImageClick}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
                title="Enviar imagem de planta para identificação"
                disabled={isUploading || isProcessing}
              >
                {isUploading || isProcessing ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[4px] border-gray-200 border-t-gray-600 border-l-gray-600 animate-spin"></div>
                ) : (
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
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                )}
              </button>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="p-3 rounded-xl bg-gradient-to-r from-[#7ECD2C] to-[#9BDE5A] hover:from-[#6CB925] hover:to-[#8AC94D] transition-all shadow-sm hover:shadow-md"
                title="Buscar"
                disabled={isUploading || isProcessing}
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
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Hidden ImageKit Upload Component */}
        <ImageKitProvider
          publicKey={publicKey}
          urlEndpoint={urlEndpoint}
          authenticator={authenticator}
        >
          <div className="hidden">
            <IKUpload
              id="imageInput"
              className="hidden"
              fileName="seed_image.jpg"
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onChange={() => setIsUploading(true)}
            />
          </div>
        </ImageKitProvider>
      </div>

      {/* Popular Searches */}
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
                disabled={isUploading || isProcessing}
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
