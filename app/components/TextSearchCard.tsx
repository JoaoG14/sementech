import React, { useState } from "react";
import Image from "next/image";
import checkmark from "../checkmark.png";
import ReportModal from "./ReportModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

const FlagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    className="w-4 h-4 fill-[#666]"
  >
    <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24L0 64 0 350.5 0 400l0 88c0 13.3 10.7 24 24 24s24-10.7 24-24l0-100 80.3-20.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-279.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L48 52l0-28zm0 77.5l96.6-24.2c27-6.7 55.5-3.6 80.4 8.8c54.9 27.4 118.7 29.7 175 6.8l0 241.8-24.4 9.1c-33.7 12.6-71.2 10.7-103.4-5.4c-48.2-24.1-103.3-30.1-155.6-17.1L48 338.5l0-237z" />
  </svg>
);

interface ProductInfo {
  thumbnail: string;
  source: string;
  title: string;
  price: string;
  url: string;
}

interface TextSearchCardProps {
  productInfo: ProductInfo;
}

const TextSearchCard: React.FC<TextSearchCardProps> = ({ productInfo }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  const handleReportSubmit = async (data: {
    reason: string;
    details: string;
  }) => {
    try {
      const { error } = await supabase.from("offer_reports").insert([
        {
          reason: data.reason,
          details: data.details,
          offer_source: productInfo.source,
          offer_url: productInfo.url,
          product_page: window.location.href,
        },
      ]);

      if (error) throw error;

      toast.success("Denúncia enviada");
      setIsReportModalOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Erro ao enviar denúncia");
    }
  };

  return (
    <>
      <a
        href={"/redirect/" + productInfo.url}
        target="_blank"
        id="RecomendationCard"
        className="text-left border-[#c1c1c1] border-[1px] rounded-md max-w-[260px] relative flex flex-col h-full"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsReportModalOpen(true);
          }}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        >
          <FlagIcon />
        </button>

        <div className="flex aspect-square justify-center items-center">
          <img
            className="w-48 h-48 xs:w-[52] xs:h-[52] my-auto mx-auto p-3 rounded-md"
            src={
              productInfo.thumbnail.includes("https")
                ? productInfo.thumbnail
                : "data:image/png;base64," + productInfo.thumbnail
            }
          />
        </div>

        <div className="">
          <img
            className="w-4  inline ml-2 rounded-sm mb-0.5"
            src={`https://s2.googleusercontent.com/s2/favicons?domain=www.${
              productInfo.source?.replace(" ", "")?.split(".com.br")[0]
            }.com.br`}
          />

          <a className="px-2 w-[80%] font-black text-[#888888] inline truncate leading-none text-xs xs:text-sm">
            {productInfo.source}
          </a>

          <Image
            src={checkmark}
            className="w-[12px] inline-block mb-0.5"
            alt="checkmark"
          />
        </div>

        <h2 className="text-left text-[#404040] mx-2 font-bold text-md mb-1.5 line-clamp-2 min-h-[48px]">
          {productInfo.title}
        </h2>

        <div className="flex flex-grow">
          <a className="ml-2  mb-2 inline-block rounded-md font-black text-xl text-black ax-3 ">
            R${" "}
            {Number(productInfo.price).toLocaleString("pt-BR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </a>
          {/* <a className="mx-0.5 inline-block rounded-md font-black text-[12px] mt-0.5 text-black ax-3 ">
            {productInfo.price?.split(",")[1]?.length < 2
              ? productInfo.price?.slice(-1) + "0"
              : productInfo.price?.slice(-2)}
          </a> */}
        </div>

        <div className="mt-auto">
          <a
            href={"/redirect/" + productInfo.url?.split("%3F")[0]}
            target="_blank"
            className="text-gray-700 cursor-pointer border-gray-500 border-[1px] bg-white text-lg font-black m-2 px-auto py-1.5 mt-0 rounded-sm flex items-center justify-center"
          >
            Ver na Loja
          </a>

          <a
            href={`/${productInfo.url}`}
            className="text-white bg-[#3042FB] text-lg font-black m-2 px-auto py-2 mt-0 rounded-sm flex items-center justify-center"
          >
            Achar Similares
          </a>
        </div>
      </a>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        offerSource={productInfo.source}
        offerUrl={productInfo.url}
      />
    </>
  );
};

export default TextSearchCard;
