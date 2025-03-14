"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

  useEffect(() => {
    try {
      const dataParam = searchParams.get("data");
      if (!dataParam) {
        setError("Nenhum dado de comparação encontrado");
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setResults(parsedData);
    } catch (err) {
      console.error("Error parsing results:", err);
      setError("Erro ao processar os resultados da comparação");
    } finally {
      setLoading(false);
    }
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
          <Link
            href="/"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Voltar para a página inicial
          </Link>
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
                    <Image
                      src={match.imageUrl}
                      alt={match.name}
                      fill
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
                    <Image
                      src={match.imageUrl}
                      alt={match.name}
                      fill
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
                    <Image
                      src={match.imageUrl}
                      alt={match.name}
                      fill
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
