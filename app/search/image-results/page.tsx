"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiBaseUrl } from "../../shared";

interface SeedMatch {
  id: string;
  name: string;
  similarityScore: number;
  imageUrl: string;
}

interface ComparisonResults {
  bestMatches: SeedMatch[];
  goodMatches: SeedMatch[];
  possibleMatches: SeedMatch[];
  allResults: SeedMatch[];
}

// Format similarity score as percentage
const formatSimilarity = (score: number) => {
  return `${Math.round(score * 100)}%`;
};

// Create a separate client component that uses useSearchParams
const ImageResultsContent = () => {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ComparisonResults | null>(null);
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

        // Use relative URL if apiBaseUrl is not defined
        const apiUrl = apiBaseUrl
          ? `${apiBaseUrl}/api/image-comparison?id=${resultId}`
          : `/api/image-comparison?id=${resultId}`;

        console.log("Fetching results from:", apiUrl);
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API response error:", response.status, errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, details: ${errorText}`
          );
        }

        const data = await response.json();

        // Import seeds data from shared
        const { seeds } = await import("../../shared/seeds");

        // Process the API response which now only contains IDs and similarity scores
        if (!data || !data.matches) {
          throw new Error("Invalid data format received from API");
        }

        // Map the matches to full seed data
        const processedMatches = data.matches
          .map((match: { id: string; similarityScore: number }) => {
            const seedData = seeds.find((seed) => seed.id === match.id);
            if (!seedData) {
              console.warn(`Seed with ID ${match.id} not found in seeds data`);
              return null;
            }

            return {
              id: match.id,
              name: seedData.name,
              similarityScore: match.similarityScore,
              imageUrl: seedData.img,
            };
          })
          .filter(Boolean);

        // Categorize matches based on similarity score
        const bestMatches = processedMatches.filter(
          (match: SeedMatch) => match.similarityScore > 0.9
        );
        const goodMatches = processedMatches.filter(
          (match: SeedMatch) =>
            match.similarityScore > 0.87 && match.similarityScore <= 0.9
        );
        const possibleMatches = processedMatches.filter(
          (match: SeedMatch) =>
            match.similarityScore > 0.67 && match.similarityScore <= 0.87
        );

        // Create the results object
        const results: ComparisonResults = {
          bestMatches,
          goodMatches,
          possibleMatches,
          allResults: processedMatches,
        };

        setResults(results);
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

  const hasMatches =
    results.bestMatches.length > 0 ||
    results.goodMatches.length > 0 ||
    results.possibleMatches.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Resultados da Identificação
          </h1>
          <p className="text-gray-600">
            Encontramos {results.allResults.length} sementes em nosso banco de
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
        {results.bestMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-700 border-b pb-2">
              Melhores Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.bestMatches.map((match) => (
                <Link
                  href={`/details/${match.id}`}
                  key={match.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={match.imageUrl}
                      alt={match.name}
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {formatSimilarity(match.similarityScore)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{match.name}</h3>
                    <p className="text-sm text-gray-600">
                      Correspondência: {formatSimilarity(match.similarityScore)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Good Matches */}
        {results.goodMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">
              Boas Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.goodMatches.map((match) => (
                <Link
                  href={`/details/${match.id}`}
                  key={match.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={match.imageUrl}
                      alt={match.name}
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {formatSimilarity(match.similarityScore)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{match.name}</h3>
                    <p className="text-sm text-gray-600">
                      Correspondência: {formatSimilarity(match.similarityScore)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Possible Matches */}
        {results.possibleMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-700 border-b pb-2">
              Possíveis Correspondências
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.possibleMatches.map((match) => (
                <Link
                  href={`/details/${match.id}`}
                  key={match.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={match.imageUrl}
                      alt={match.name}
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {formatSimilarity(match.similarityScore)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{match.name}</h3>
                    <p className="text-sm text-gray-600">
                      Correspondência: {formatSimilarity(match.similarityScore)}
                    </p>
                  </div>
                </Link>
              ))}
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
