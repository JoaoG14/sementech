"use client";

import Image from "next/image";
import checkmark from "../checkmark.png";
import React, { useEffect, useState } from "react";
import { verifiedStores } from "../shared";

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
}

const OurPick: React.FC<OfferCardProps> = ({ offersInfo }) => {
  const productPrice: any = document.querySelector("#productPrice");
  let originalPrice = Number(
    productPrice.innerHTML.slice(3).replace(".", "").split(",")[0]
  );
  return (
    <div className="w-[96vw] mx-auto">
      <div className="flex h-36 max-w-[500px]">
        {/* <div className="inline absolute mr-[2vw] right-0 p-1 px-2 text-xs rounded-md font-bold text-white bg-green-500">Menor Preço</div> */}
        <div className="flex h-32 w-32 m-2">
          <img
            className="max-w-32 max-h-32 my-auto mx-auto border-[#6E6E6E] rounded-lg"
            src={offersInfo.thumbnail}
          />
        </div>

        <div className="inline my-auto  px-2">
          <div>
            <img
              className="w-4  inline mr-2 rounded-sm"
              src={
                offersInfo.source_icon
                  ? offersInfo.source_icon
                  : verifiedStores[offersInfo.source]?.source_icon
                  ? verifiedStores[offersInfo.source].source_icon
                  : !offersInfo.source.includes(".com")
                  ? `https://s2.googleusercontent.com/s2/favicons?domain=www.${offersInfo.source
                      .replace(" ", "")
                      .replace("é", "e")
                      .replace("!", "")}.com.br`
                  : `https://s2.googleusercontent.com/s2/favicons?domain=www.${offersInfo.source}`
              }
            />
            <p className="text-[#665] font-black  inline text-sm whitespace-nowrap">
              {/* transforms every first letter of word to uppercase */}
              {verifiedStores[offersInfo.source]?.displayName
                ? verifiedStores[offersInfo.source]?.displayName
                : offersInfo.source.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
                    letter.toUpperCase()
                  )}
            </p>
            <div className="relative group inline-block">
              <Image
                src={checkmark}
                className="w-3.5 ml-1.5 inline-block"
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
          </div>
          {/* mb-[4px] font-black w-[54vw] p2 max-w-[320px] text-md line-clamp-2 */}
          <h1 className="font-bold text-base max-w-[320px] mt-1.5 text-black overflow-hidden text-ellipsis line-clamp-2 leading-tight mb-3">
            <a href={"/redirect/" + offersInfo.link}>{offersInfo.title}</a>
          </h1>
          <div className="flex">
            <a
              target="_blank"
              href={"/redirect/" + offersInfo.link}
              className="inline-block text-[#3042FB] mr-2 text-xl cursor-pointer font-black"
            >
              R$ {Math.floor(offersInfo.price.slice(3)).toLocaleString("pt-BR")}
            </a>
            <div className="flex">
              <a className="inline-block truncate ml-1 font-extrabold text-base my-auto text-[#FF2E12] leading-none mb-1.5">
                {!Number.isNaN(originalPrice)
                  ? Math.floor(
                      Number(originalPrice) - offersInfo.price.slice(3)
                    ) < 1
                    ? null
                    : `-${Math.floor(
                        (Number(originalPrice) -
                          Number(offersInfo.price.slice(3))) /
                          (Number(originalPrice) / 100)
                      )}%`
                  : null}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurPick;
