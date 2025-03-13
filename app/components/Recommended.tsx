"use client";

import React, { useState } from "react";
import RecomendationCard from "./RecomendationCard";

// Define the seed interface with relevant seed data
interface Seed {
  id: string;
  img: string;
  name: string;
  germination_rate: string;
  seed_count: string;
  origin: string;
  season: string;
  url: string;
}

// Dummy seed data with seed-specific information
const dummySeeds: Seed[] = [
  {
    id: "001",
    img: "https://cdn.awsli.com.br/600x450/2195/2195322/produto/156269308/19ab542e3b.jpg",
    name: "Semente de Girassol",
    germination_rate: "90%",
    seed_count: "30",
    origin: "Brasil",
    season: "Primavera/Verão",
    url: "https://example.com/girassol-ornamental",
  },
];

const Recommended = () => {
  return (
    <div className="mb-2 text-center">
      <SeedDisplay />
    </div>
  );
};

// Seed display component with dummy data
const SeedDisplay = () => {
  const [seeds] = useState<Seed[]>(dummySeeds);

  return (
    <>
      {seeds.length === 0 ? (
        <div className="text-gray-500 mb-32">
          Nenhuma semente disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mx-auto px-2 w-full max-w-[1200px] mb-8">
          {seeds.map((seed, index) => (
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

      {/* End message */}
      <div className="text-gray-500 mb-32">
        Você viu todas as sementes disponíveis!
      </div>
    </>
  );
};

export default Recommended;
