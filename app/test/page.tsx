"use client";

import React from "react";
import SearchButton from "../components/SearchButton";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teste de Busca por Imagem
          </h1>
          <p className="text-gray-600">
            Esta página testa o sistema de busca por imagem
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <SearchButton />
        </div>
      </div>
    </div>
  );
};

export default TestPage;
