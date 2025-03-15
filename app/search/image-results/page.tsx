"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SeedMatch {
  id: string;
  similarityScore: number;
}

interface ComparisonResult {
  resultId: string;
  matches: SeedMatch[];
}

interface SeedData {
  id: string;
  name: string;
  img: string;
  description: string;
}

// Format similarity score as percentage
const formatSimilarity = (score: number) => {
  return `${Math.round(score * 100)}%`;
};

// Categorize matches based on similarity score
const categorizeMatches = (matches: SeedMatch[]) => {
  return {
    bestMatches: matches.filter((match) => match.similarityScore > 0.9),
    goodMatches: matches.filter(
      (match) => match.similarityScore > 0.85 && match.similarityScore <= 0.9
    ),
    possibleMatches: matches.filter(
      (match) => match.similarityScore > 0.67 && match.similarityScore <= 0.85
    ),
  };
};

// Main content component that uses useSearchParams
const ImageResultsContent = () => {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [seedsData, setSeedsData] = useState<Record<string, SeedData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get the result ID from URL params
        const resultId = searchParams.get("id");

        if (!resultId) {
          setError("ID de resultado não encontrado");
          setLoading(false);
          return;
        }

        // Fetch results from API
        const response = await fetch(`/api/image-comparison?id=${resultId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, details: ${errorText}`
          );
        }

        const data = await response.json();

        // Import seeds data
        const { seeds } = await import("../../shared/seeds");

        // Create a lookup map for seed data
        const seedsMap: Record<string, SeedData> = {};
        seeds.forEach((seed) => {
          seedsMap[seed.id] = {
            id: seed.id,
            name: seed.name,
            img: seed.img,
            description: seed.description,
          };
        });

        setSeedsData(seedsMap);
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Erro ao buscar resultados");
        setErrorDetails(
          err instanceof Error ? err.message : "Erro desconhecido"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Ocorreu um erro
          </h1>
          <p className="text-gray-600 mb-6">{error || "Erro desconhecido"}</p>

          {errorDetails && (
            <div className="mb-6 text-left bg-gray-100 p-4 rounded-lg overflow-auto max-h-40 text-xs">
              <p className="font-semibold mb-1">Detalhes técnicos:</p>
              <pre className="whitespace-pre-wrap">{errorDetails}</pre>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Categorize matches
  const { bestMatches, goodMatches, possibleMatches } = categorizeMatches(
    results.matches
  );

  // Check if we have any matches
  const hasMatches =
    bestMatches.length > 0 ||
    goodMatches.length > 0 ||
    possibleMatches.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Resultados da Identificação
          </h1>
          <p className="text-gray-600">
            Encontramos {results.matches.length} sementes em nosso banco de
            dados
          </p>
        </div>

        {!hasMatches && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
            <div className="text-yellow-500 text-5xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Nenhuma correspondência encontrada
            </h2>
            <p className="text-gray-600 mb-4">
              Não encontramos correspondências significativas para a imagem
              enviada. Tente com outra imagem ou busque por texto.
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </Link>
          </div>
        )}

        {/* Best Matches */}
        {bestMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">
              Melhores Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestMatches.map((match) => {
                const seed = seedsData[match.id];
                if (!seed) return null;

                return (
                  <Link
                    href={`/details/${match.id}`}
                    key={match.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={seed.img}
                        alt={seed.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {formatSimilarity(match.similarityScore)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {seed.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Correspondência:{" "}
                        {formatSimilarity(match.similarityScore)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Good Matches */}
        {goodMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">
              Boas Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goodMatches.map((match) => {
                const seed = seedsData[match.id];
                if (!seed) return null;

                return (
                  <Link
                    href={`/details/${match.id}`}
                    key={match.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={seed.img}
                        alt={seed.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {formatSimilarity(match.similarityScore)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {seed.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Correspondência:{" "}
                        {formatSimilarity(match.similarityScore)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Possible Matches */}
        {possibleMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-700 border-b pb-2">
              Possíveis Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {possibleMatches.map((match) => {
                const seed = seedsData[match.id];
                if (!seed) return null;

                return (
                  <Link
                    href={`/details/${match.id}`}
                    key={match.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={seed.img}
                        alt={seed.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {formatSimilarity(match.similarityScore)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {seed.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Correspondência:{" "}
                        {formatSimilarity(match.similarityScore)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
const ImageResultsPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImageResultsContent />
    </Suspense>
  );
};

export default ImageResultsPage;
