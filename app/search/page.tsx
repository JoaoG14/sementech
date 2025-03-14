"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RecomendationCard from "../components/RecomendationCard";
import { seeds, Seed } from "../shared/seeds";

const SearchContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [searchResults, setSearchResults] = useState<Seed[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter seeds based on search query
  useEffect(() => {
    const query = searchParams.get("query") || "";

    if (!query) {
      setSearchResults(seeds);
      return;
    }

    setIsSearching(true);

    // Filter seeds that match the query in name, description, or other relevant fields
    const searchTerms = query.toLowerCase().split(" ");

    // First, find seeds that match the query in the name field
    const nameMatches = seeds.filter((seed) => {
      return searchTerms.some((term) => seed.name.toLowerCase().includes(term));
    });

    // Then, find seeds that match in other fields but not in name
    const otherMatches = seeds.filter((seed) => {
      // Skip seeds that already matched by name
      if (nameMatches.some((match) => match.id === seed.id)) {
        return false;
      }

      return searchTerms.some(
        (term) =>
          seed.description.toLowerCase().includes(term) ||
          seed.origin.toLowerCase().includes(term) ||
          seed.season.toLowerCase().includes(term) ||
          seed.soil_type.toLowerCase().includes(term) ||
          seed.companion_plants.some((plant) =>
            plant.toLowerCase().includes(term)
          )
      );
    });

    // Combine the results, with name matches first
    const filteredSeeds = [...nameMatches, ...otherMatches];

    setSearchResults(filteredSeeds);
    setIsSearching(false);
  }, [searchParams]);

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
        {isSearching ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ECD2C]"></div>
            <p className="mt-2 text-gray-600">Buscando...</p>
          </div>
        ) : (
          <div className="mb-2 text-center">
            {searchParams.get("query") && (
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Resultados para "{searchParams.get("query")}"
              </h2>
            )}

            {searchResults.length === 0 ? (
              <div className="text-gray-500 py-16">
                <p className="text-xl mb-2">Nenhum resultado encontrado</p>
                <p className="text-gray-400">Tente buscar por outros termos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mx-auto px-2 w-full max-w-[1200px] mb-8">
                {searchResults.map((seed, index) => (
                  <div key={seed.id || `seed-${seed.name}-${index}`}>
                    <RecomendationCard
                      seedInfo={{
                        id: seed.id,
                        img: seed.img,
                        name: seed.name,
                        germination_rate: seed.germination_rate,
                        seed_count: seed.seed_count,
                        origin: seed.origin,
                        season: seed.season,
                        url: seed.url,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="text-gray-500 mb-32">
                Você viu todos os resultados disponíveis!
              </div>
            )}
          </div>
        )}
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
