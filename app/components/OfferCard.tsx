"use client";

import Image from "next/image";
import checkmark from "../checkmark.png";
import React, { useEffect, useState } from "react";
import { verifiedStores } from "../shared";
import lockIcon from "@/public/lock-icon.png";
import ReportModal from "./ReportModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

interface VerifiedStore {
  source_icon: string;
  verified: boolean;
  displayName: string;
  names: string[];
}

interface OffersInfo {
  position: number;
  thumbnail: string;
  source_icon: string;
  source: string;
  title: string;
  price: any;
  link: string;
}

interface OfferCardProps {
  offersInfo: OffersInfo;
  locked?: boolean;
  verified?: boolean;
  searchId?: string;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offersInfo,
  locked = false,
  verified,
  searchId,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hasJustCopied, setHasJustCopied] = useState(false);
  const supabase = createClientComponentClient();

  // Extract domain from link and check if it's in verifiedStores
  const extractDomain = (url: string): string => {
    try {
      // Make sure the URL has a protocol
      let fullUrl = url;
      if (!url.match(/^https?:\/\//i)) {
        fullUrl = "https://" + url;
      }

      // Use URL API to parse the URL
      const urlObj = new URL(fullUrl);
      return urlObj.hostname;
    } catch (error) {
      console.error("Error extracting domain:", error);
      return "";
    }
  };

  const linkDomain = extractDomain(offersInfo.link);
  const isVerifiedByDomain = Object.keys(verifiedStores).some(
    (storeDomain) =>
      linkDomain === storeDomain ||
      linkDomain.endsWith("." + storeDomain) ||
      storeDomain.endsWith("." + linkDomain)
  );

  useEffect(() => {
    // Check if extension is installed
    const checkExtension = () => {
      // Add listener for extension response first
      const handleExtensionResponse = (event: any) => {
        if (event.detail?.hasExtension) {
          setHasExtension(true);
        }
      };

      window.addEventListener(
        "acharPromoExtensionResponse",
        handleExtensionResponse
      );

      // Then dispatch the check event
      const event = new CustomEvent("checkAcharPromoExtension");
      window.dispatchEvent(event);

      // Check again after a short delay in case the extension wasn't ready
      setTimeout(() => {
        window.dispatchEvent(event);
      }, 500);

      // Cleanup
      return () => {
        window.removeEventListener(
          "acharPromoExtensionResponse",
          handleExtensionResponse
        );
      };
    };

    checkExtension();
  }, []);

  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  const productPrice: any = document.querySelector("#productPrice");
  let originalPrice = Number(
    productPrice?.innerHTML.slice(3).replace(".", "").split(",")[0]
  );

  const handleReportSubmit = async (data: {
    reason: string;
    details: string;
  }) => {
    try {
      const { error } = await supabase.from("offer_reports").insert([
        {
          reason: data.reason,
          details: data.details,
          offer_source: offersInfo.source,
          offer_url: offersInfo.link,
          product_page: window.location.href,
        },
      ]);

      if (error) throw error;

      toast.success("Denúncia enviada", {
        position: "top-center",
      });
      setIsReportModalOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Erro ao enviar denúncia", {
        position: "top-center",
      });
    }
  };

  const ThumbsDownIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-4 h-4 m-0.5 mt-1 mr-1.5 fill-[#666]"
    >
      <path d="M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16l-97.5 0c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8L384 32c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32L0 128c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      className="w-4 h-4  m-0.5 mt-1 fill-[#666]"
    >
      <path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-4 h-4 m-0.5 mt-1 fill-[#32dd3d]"
    >
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z" />
    </svg>
  );

  // Show locked version only if it's desktop AND locked AND user doesn't have extension
  if (locked && isDesktop && !hasExtension) {
    return (
      <a
        href="https://chromewebstore.google.com/detail/acharpromo-ache-os-menore/pklgidabbaffojhhhhhglnlimfipgikc?hl=pt-BR"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[144px] min-h-[144px] max-h-[144px] transition-transform hover:scale-[1.02] p-2.5 rounded-lg mb-3 border border-[#6E6E6E] w-[96vw] max-w-[500px] mx-auto bg-white"
      >
        <div className="relative w-[120px] h-[120px] mr-3.5 flex-shrink-0">
          <div className="w-full h-full border border-[#6E6E6E] rounded overflow-hidden">
            <div className="w-full h-full blur-sm">
              <img
                className="w-full h-full object-contain rounded"
                src={offersInfo.thumbnail}
                alt={offersInfo.title}
              />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(117,117,117,0.25)] rounded border border-[#6E6E6E]">
            <Image
              src={lockIcon}
              alt="Lock"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        </div>

        <div className="flex-grow min-w-0 h-[120px] flex flex-col justify-center">
          <div>
            <h3 className="text-black font-black text-md mb-4 leading-tight">
              Adicione nossa extensão <br /> GRÁTIS para visualizar
            </h3>
            <span className="bg-[#3042FB] text-white font-black py-2 px-4 rounded-lg text-center w-32">
              Desbloquear
            </span>
          </div>
        </div>
      </a>
    );
  }

  // Show normal version if it's either mobile, unlocked, or user has extension
  return (
    <>
      <div className="flex h-[144px] min-h-[144px] max-h-[144px] p-2.5 rounded-lg mb-3 border border-[#6E6E6E] w-[96vw] max-w-[500px] mx-auto cursor-pointer transition-transform hover:scale-[1.02] bg-white">
        <a
          target="_blank"
          href={
            offersInfo?.link?.includes("pexinxas")
              ? "/redirect/" + offersInfo?.link?.replace("google", "pexinxas")
              : "/redirect/" + offersInfo?.link?.split("?")[0]
          }
          className="flex items-center w-full h-full"
        >
          <div className="w-[120px] h-[120px] mr-3.5 flex-shrink-0">
            <img
              className="w-full h-full object-contain border border-[#6E6E6E] rounded"
              src={offersInfo.thumbnail}
              alt={offersInfo.title}
            />
          </div>

          <div className="flex-grow min-w-0 h-[120px] flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2 mt-1">
                <img
                  className="w-4 h-4 mr-1.5"
                  src={
                    (Object.entries(verifiedStores).find(([_, store]) =>
                      (store as VerifiedStore).names.includes(offersInfo.source)
                    )?.[1] as VerifiedStore | undefined)
                      ? (
                          Object.entries(verifiedStores).find(([_, store]) =>
                            (store as VerifiedStore).names.includes(
                              offersInfo.source
                            )
                          )![1] as VerifiedStore
                        ).source_icon
                      : !offersInfo.source.includes(".com")
                      ? `https://s2.googleusercontent.com/s2/favicons?domain=www.${offersInfo.source
                          .replace(" ", "")
                          .replace("é", "e")
                          .replace("!", "")
                          .replace("&", "")}.com.br`
                      : `https://s2.googleusercontent.com/s2/favicons?domain=www.${offersInfo.source}`
                  }
                  alt={offersInfo.source}
                />
                <span className="text-[#665] font-black text-sm whitespace-nowrap">
                  {verifiedStores[offersInfo.source]?.displayName
                    ? verifiedStores[offersInfo.source]?.displayName.slice(
                        0,
                        20
                      )
                    : offersInfo.source
                        .replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                          letter.toUpperCase()
                        )
                        .slice(0, 20)}
                </span>
                {isVerifiedByDomain ? (
                  <div className="relative group">
                    <Image
                      src={checkmark}
                      className="w-3.5 ml-1.5"
                      alt="verified store"
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                      <div className="bg-white text-[#666] text-xs py-1.5 px-3 rounded-md shadow-md border border-gray-200 whitespace-nowrap">
                        Achar.promo pode receber comissões de lojas parceiras
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1">
                        <div className="border-4 border-transparent border-t-white"></div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {offersInfo.title.toLowerCase().includes("usado") && (
                  <span className="ml-2 px-2 py-0.5 bg-[#F18D13] text-white rounded text-xs font-bold">
                    Usado
                  </span>
                )}
              </div>
              <h2 className="font-bold text-base text-black overflow-hidden text-ellipsis line-clamp-2 leading-tight mb-2">
                {offersInfo.title}
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {offersInfo.price ? (
                  <>
                    <span className="font-black text-xl text-[#3042FB] leading-none mb-1">
                      R$ {offersInfo.price.slice(3).toLocaleString("pt-BR")}
                    </span>
                    {!Number.isNaN(originalPrice) &&
                      Math.floor(
                        Number(originalPrice) -
                          Number(
                            offersInfo.price
                              .slice(3)
                              ?.replace(",", "")
                              ?.replace(".", "")
                          )
                      ) > 4 && (
                        <span className="ml-2.5 font-extrabold text-base text-[#FF2E12] leading-none mb-1">
                          -
                          {Math.floor(
                            (Number(originalPrice) -
                              Number(
                                offersInfo.price
                                  .slice(3)
                                  ?.replace(",", "")
                                  ?.replace(".", "")
                              )) /
                              (Number(originalPrice) / 100)
                          )}
                          %
                        </span>
                      )}
                  </>
                ) : (
                  <button className="bg-[#3042FB] text-white font-black py-1.5 px-4 rounded-md">
                    Ver no site
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const shareUrl = `https://achar.promo/p/${searchId}`;
                    if (!isDesktop && navigator.share) {
                      navigator.share({
                        title: offersInfo.title,
                        url: shareUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      setHasJustCopied(true);
                      toast.success("Link copiado!", {
                        position: "top-center",
                      });
                      setTimeout(() => setHasJustCopied(false), 2000);
                    }
                  }}
                  className="text-[#666] font-bold p-1 text-sm hover:underline"
                >
                  {isDesktop && hasJustCopied ? <CheckIcon /> : <ShareIcon />}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsReportModalOpen(true);
                  }}
                  className="text-[#666] font-bold p-1 text-sm hover:underline"
                >
                  <ThumbsDownIcon />
                </button>
              </div>
            </div>
          </div>
        </a>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        offerSource={offersInfo.source}
        offerUrl={offersInfo.link}
      />
    </>
  );
};

export default OfferCard;
