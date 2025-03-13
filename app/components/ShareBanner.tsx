"use client";

import React from "react";
import { usePathname } from "next/navigation";

const ShareBanner = ({ searchId }: any) => {
  const pathname = usePathname();
  searchId = JSON.stringify(searchId)?.slice(1, -1);

  if (pathname.slice(0, 3) === "/p/") {
    searchId = pathname.slice(3).toString();
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "achar.promo",
          url: "https://achar.promo/p/" + searchId,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        console.log("Web Share API not supported");
        // You could add a fallback here, like copying to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copiado para a área de transferência!");
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="fixed bottom-0 px-7 flex w-full md:hidden bg-[#3042FB] h-20 items-center flex-row justify-between">
      <p className="font-[1000] text-white text-xl inline">achar.promo</p>
      <button
        onClick={handleShare}
        className="hover:bg-slate-50 cursor-pointer inline py-1.5 px-3 rounded-sm text-[#3042FB] text-lg font-[1000] bg-white"
      >
        Compartilhar
      </button>
    </div>
  );
};

export default ShareBanner;
