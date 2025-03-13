"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RecomendationCard from "../components/RecomendationCard";
import Recommended from "../components/Recommended";

const SearchContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );

  const handleSearch = () => {
    if (!searchQuery) return;
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Header */}
      <div className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="relative">
            <div className="relative bg-white shadow-lg rounded-2xl p-2 border border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar por sementes, plantas ou culturas..."
                  className="flex-1 bg-transparent px-6 py-2 text-gray-800 placeholder-gray-400 text-lg focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="p-3 rounded-xl bg-gradient-to-r from-[#7ECD2C] to-[#9BDE5A] hover:from-[#6CB925] hover:to-[#8AC94D] transition-all shadow-sm hover:shadow-md"
                  title="Buscar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
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
      </div>

      {/* Search Results Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Recommended />
      </div>
    </div>
  );
};

const Search = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default Search;
