"use client";

import React from "react";
import Image from "next/image";
import checkmark from "../checkmark.png";
import { isSourceDomainVerified } from "../utils/storeVerification";

interface ProductDetailsProps {
  productImg: string;
  productTitle: string;
  productSource: string;
  productPrice: string;
  productUrl: string;
  domain: string;
  isTextSearch: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  productImg,
  productTitle,
  productSource,
  productPrice,
  productUrl,
  domain,
  isTextSearch,
}) => {
  if (isTextSearch) {
    return null;
  }

  return (
    <div id="productDetails">
      <img
        id="productImage"
        className="mx-auto w-full"
        src={productImg ? productImg : ""}
        alt={productTitle || "Product image"}
      />
      <div id="productDescription" className="mt-4">
        <div className="h-[1px] bg-[#C1C1C1]"></div>
        <div id="sourceContainer" className="pt-2">
          <p
            id="productSource"
            className="ml-3 lg:ml-[0px] mt-3 inline text-[#959595] font-black"
          >
            <a href={"/redirect/" + productUrl}>
              {productSource ? productSource : ""}
            </a>
          </p>
          <Image
            src={checkmark}
            className="mx-2 mb-0.5 w-4 inline"
            alt="checkmark"
            id="checkmark"
            style={{
              display:
                domain && isSourceDomainVerified(domain) ? "inline" : "none",
            }}
          />
        </div>
        <h1
          id="productTitle"
          className="text-2xl font-black mx-3 lg:ml-[0px] line-clamp-2"
        >
          <a href={"/redirect/" + productUrl}>
            {productTitle ? productTitle : ""}
          </a>
        </h1>
        <a
          href={"/redirect/" + productUrl}
          className="hover:bg-[#2c38c5] rounded-md my-2 mb-4 font-mulish inline-block ml-3 lg:ml-[0px] px-3 py-1 text-white text-2xl font-black bg-[#3042FB]"
        >
          <span id="productPrice">
            {!isNaN(Number(productPrice))
              ? `R$ ${Number(productPrice).toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              : "ver produto"}
          </span>
        </a>
        <div className="h-[1px] bg-[#C1C1C1]"></div>
      </div>
    </div>
  );
};

export default ProductDetails;
