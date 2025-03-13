import React, { Suspense } from "react";
import ProductPage from "@/app/components/ProductPage";
import NavBar from "@/app/components/NavBar";
import Recommended from "@/app/components/Recommended";
import ShareBanner from "@/app/components/ShareBanner";
import TopBar from "@/app/components/TopBar";

const productCachedPage = () => {
  return (
    <div className="overflow-x-hidden">
      <TopBar />
      <NavBar />
      <Suspense>
        <ProductPage />
      </Suspense>
    </div>
  );
};

export default productCachedPage;
