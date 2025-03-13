"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Seed, seeds } from "@/app/shared/seeds";
import Image from "next/image";
import NavBar from "@/app/components/NavBar";
const Details = () => {
  const params = useParams();
  const [seed, setSeed] = useState<Seed | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const foundSeed = seeds.find((s) => s.id === id);
    setSeed(foundSeed || null);
  }, [params.id]);

  if (!seed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">Semente não encontrada</div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm">
          {/* Header Section */}
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Section */}
            <div className="relative aspect-square bg-white flex items-center justify-center p-6 border rounded-xl">
              <img
                src={seed.img}
                alt={seed.name}
                width={400}
                height={400}
                className="object-contain max-h-full"
              />
            </div>

            {/* Basic Info Section */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{seed.name}</h1>
              <p className="text-gray-600 leading-relaxed">
                {seed.description}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#E8F5D6] p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Taxa de Germinação
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {seed.germination_rate}
                  </div>
                </div>
                <div className="bg-[#E8F5D6] p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Qtd. de Sementes</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {seed.seed_count}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="border-t border-gray-100 p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Informações de Cultivo
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard
                title="Profundidade de Plantio"
                value={seed.planting_depth}
              />
              <InfoCard title="Espaçamento" value={seed.spacing} />
              <InfoCard title="Exposição Solar" value={seed.sun_exposure} />
              <InfoCard title="Rega" value={seed.watering} />
              <InfoCard
                title="Tempo de Germinação"
                value={seed.days_to_germination}
              />
              <InfoCard
                title="Tempo até Colheita"
                value={seed.days_to_harvest}
              />
              <InfoCard title="Altura da Planta" value={seed.height} />
              <InfoCard title="Tipo de Solo" value={seed.soil_type} />
            </div>
          </div>

          {/* Companion Plants Section */}
          <div className="border-t border-gray-100 p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Plantas Companheiras
            </h2>
            <div className="flex flex-wrap gap-2">
              {seed.companion_plants.map((plant, index) => (
                <span
                  key={index}
                  className="bg-[#E8F5D6] px-4 py-2 rounded-full text-gray-900"
                >
                  {plant}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-100 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard title="Origem" value={seed.origin} />
              <InfoCard title="Estação Ideal" value={seed.season} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="text-sm text-gray-600">{title}</div>
    <div className="text-lg font-medium text-gray-900">{value}</div>
  </div>
);

export default Details;
