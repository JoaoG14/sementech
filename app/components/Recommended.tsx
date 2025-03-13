"use client";

import React, { useState } from "react";
import RecomendationCard from "./RecomendationCard";
import { seeds, Seed } from "../shared/seeds";

const Recommended = () => {
  return (
    <div className="mb-2 text-center">
      <SeedDisplay />
    </div>
  );
};

// Seed display component using imported seeds data
const SeedDisplay = () => {
  const [displayedSeeds] = useState<Seed[]>(seeds);

  return (
    <>
      {displayedSeeds.length === 0 ? (
        <div className="text-gray-500 mb-32">
          Nenhuma semente disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mx-auto px-2 w-full max-w-[1200px] mb-8">
          {displayedSeeds.map((seed, index) => (
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
