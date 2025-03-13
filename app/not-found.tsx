import { Suspense } from "react";
import ProductSearch from "./components/ProductSearch";
import NavBar from "./components/NavBar";
import React from "react";
import TopBar from "./components/TopBar";
import SearchPage from "./components/SearchPage";
const NotFound = () => {
  const date = new Date();

  return (
    <>
      <Suspense>
        <SearchPage />
      </Suspense>
    </>
  );
};

export default NotFound;
