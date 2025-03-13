import React from "react";
import { useRouter } from "next/navigation";

interface SeedInfo {
  id: string;
  img: string;
  name: string;
  germination_rate: string;
  seed_count: string;
  origin: string;
  season: string;
  url: string;
}

interface RecomendationCardProps {
  seedInfo: SeedInfo;
}

const RecomendationCard: React.FC<RecomendationCardProps> = ({ seedInfo }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/details/${seedInfo.id}`);
  };

  return (
    <div className="group">
      {/* Card content */}
      <div className="relative bg-white rounded-xl shadow-sm group-hover:shadow-xl transition-all duration-300 overflow-hidden max-w-[400px] border border-gray-200">
        {/* Seed Image with gradient overlay */}
        <div className="relative aspect-square bg-white flex items-center justify-center p-6">
          <div className="absolute inset-0  group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            src={seedInfo.img}
            alt={seedInfo.name}
            className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Seed Information */}
        <div className="p-6">
          {/* Seed Name */}
          <h2 className="font-semibold text-xl mb-4 text-gray-900 transition-colors duration-300 text-left line-clamp-2 min-h-[3.5rem]">
            {seedInfo.name}
          </h2>

          {/* Seed Data List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600">Taxa de germinação</span>
              <span className="font-medium text-gray-900 bg-[#E8F5D6] px-2 py-0.5 rounded-full text-sm whitespace-nowrap">
                {seedInfo.germination_rate}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600 ">Qtd. de sementes</span>
              <span className="font-medium text-gray-900 bg-[#E8F5D6] px-2 py-0.5 rounded-full text-sm whitespace-nowrap">
                {seedInfo.seed_count}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600">Origem</span>
              <span className="font-medium text-gray-900 truncate ml-4 ">
                {seedInfo.origin}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Estação</span>
              <span className="font-medium text-[#4A7A1A] whitespace-nowrap">
                {seedInfo.season}
              </span>
            </div>
          </div>

          {/* Ver mais Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleClick}
              className="bg-[#81CD2D] text-white px-6 w-full py-2 rounded-full hover:bg-[#67a425] transition-colors duration-300 font-medium"
            >
              Ver mais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecomendationCard;
