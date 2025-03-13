"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "../shared";
import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const SearchButton = () => {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [redirectToAmazon, setRedirectToAmazon] = useState(true); // padrão é checked
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [trendingSearches] = useState([
    { icon: "🛋️", text: "Sofás", searchQuery: "Sofá" },
    { icon: "🛋️", text: "Rack para TV", searchQuery: "Rack tv" },
    { icon: "🛋️", text: "Geladeira", searchQuery: "Geladeira" },
    {
      icon: "🛋️",
      text: "Cadeira de escritório",
      searchQuery: "Cadeira de escritório",
    },
    { icon: "🛋️", text: "Air Fryer", searchQuery: "Air Fryer" },
    // { icon: "📱", text: "iPhone" },
    // { icon: "🪑", text: "Playstation 5" },
  ]);

  // Add useEffect to sync checkbox state with state variable when component mounts
  useEffect(() => {
    const checkbox = document.getElementById(
      "default-checkbox"
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = redirectToAmazon;
    }
  }, [redirectToAmazon]);

  const isValidUrl = (urlString: string) => {
    try {
      if (!urlString.includes(".com") && !urlString.includes(".br")) {
        return false;
      }
      // Add https:// if the URL doesn't start with http:// or https://
      const urlToTest = urlString.match(/^https?:\/\//)
        ? urlString
        : `https://${urlString}`;
      new URL(urlToTest);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleClick = async () => {
    const productToSearch: any = document.getElementById("searchProductInput");

    if (!productToSearch.value) {
      productToSearch.placeholder = "Por favor insira um link.";
      productToSearch.classList.add("placeholder-red-500");
      productToSearch.classList.add("font-extrabold");
      return;
    }

    // Check if the input is a valid URL
    if (!isValidUrl(url)) {
      // If not a URL, redirect to search page with the input as search parameter
      router.push(`/search/${encodeURIComponent(url)}`);
      return;
    }

    const searchBtnLink = document.getElementById("searchBtnLink");

    if (searchBtnLink) {
      searchBtnLink?.click();
    }

    if (redirectToAmazon) {
      const productUrl = url;
      const res = await fetch(`${apiBaseUrl}/api/webscraper`, {
        method: "POST",
        body: JSON.stringify({ productUrl }),
      });
      const productData = await res.json();
      setTimeout(() => {
        router.push(
          `https://www.amazon.com.br/s?k=${productData?.title}&s=relevanceblender&qid=1718885029&ds=v1%3A4hAW7qXqcJbxktT5J%2FbzeHTW2SAnCYgvvzaUj19iWO8&linkCode=ll2&tag=pexinxas05f-20&linkId=5dc93f9fe53670c62eb803710ff27075&language=pt_BR&ref_=as_li_ss_tl`
        );
      }, 2000);
    }
  };

  useEffect(() => {
    const handleCtrlV = async (event: any) => {
      const productToSearch: any =
        document.getElementById("searchProductInput");
      const text = await productToSearch.value;
      setUrl(text);

      if (
        !text.includes("https://") &&
        (text.includes(".com") || text.includes(".br"))
      ) {
        setUrl("https://" + text);
      } else {
        setUrl(text);
      }

      if (event.ctrlKey && event.key === "v") {
        const searchBtn = document.getElementById("search-btn-home");
        const searchBtnLink = document.getElementById("searchBtnLink");

        setTimeout(() => {
          if (searchBtn) {
            searchBtn.click();
            // searchBtnLink?.click();
          }
        }, 100); // Small delay to ensure state update
      }
    };

    window.addEventListener("keydown", handleCtrlV);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleCtrlV);
    };
  }, []);

  const handleImageClick = () => {
    const imageInput: any = document.getElementById("imageInput");
    const imgUploadBtn: any = document.getElementById("imgUploadBtn");
    const imgUploadSpinner: any = document.getElementById("imgUploadSpinner");

    imgUploadBtn.style.display = "none";
    imgUploadSpinner.style.display = "inline";
    imageInput.click();
  };

  const authenticator = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/imagekitauth`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error: any) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const onError = (err: any) => {
    console.log("Error", err);
  };

  const onSuccess = (res: any) => {
    router.push("/" + res.url);
  };

  return (
    <div className="relative">
      <div className="flex m-auto h-[55px] w-[90vw] max-w-[750px] border-black border rounded-md">
        <span className="px-4 hidden font-bold text-base lg:inline-flex items-center text-gray-900 bg-[#F9FAFB] rounded-e-0 border-[#484848] rounded-s-md">
          achar.promo/
        </span>
        <input
          type="text"
          id="searchProductInput" // replace border-e with rounded-r-md when you want to hide upload button
          className="m-0 px-4 focus:outline-none lg:border-s border-e lg:rounded-l-none rounded-l-md bg-white text-[#565656] min-w-0 w-full text-sm border-[#484848]"
          placeholder="Cole o link do produto aqui"
          value={url}
          autoComplete="off"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onChange={(e) => {
            if (
              !e.target.value.includes("https://") &&
              (e.target.value.includes(".com") ||
                e.target.value.includes(".br"))
            ) {
              setUrl("https://" + e.target.value);
            } else {
              setUrl(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const searchBtn = document.getElementById("search-btn-home");
              if (searchBtn) {
                searchBtn.click();
              }
            }
          }}
        />
        <span
          onClick={handleImageClick}
          className="cursor-pointer px-4 font-bold text-base inline-flex items-center text-gray-900 bg-[#F9FAFB] rounded-e-md border-[#484848]  rounded-s-0"
        >
          <ImageKitProvider
            publicKey={publicKey}
            urlEndpoint={urlEndpoint}
            authenticator={authenticator}
          >
            <IKUpload
              id="imageInput"
              className="hidden"
              fileName="upload.png"
              onError={onError}
              onSuccess={onSuccess}
            />
          </ImageKitProvider>
          <img src="/image_icon.png" id="imgUploadBtn" className="w-7" />
          <svg
            aria-hidden="true"
            id="imgUploadSpinner"
            className="hidden w-6 h-6 text-transparent animate-spin fill-[#3042FB]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </span>
      </div>

      {/* Trending Searches Dropdown */}
      {isFocused && (
        <div className="absolute z-10 w-[90vw] max-w-[750px] bg-white border border-gray-200 shadow-lg left-1/2 transform -translate-x-1/2 mt-1 rounded-lg">
          {trendingSearches.map((item, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setUrl(item.searchQuery);
                setIsFocused(false);
                setTimeout(() => {
                  const searchBtn = document.getElementById("search-btn-home");
                  if (searchBtn) {
                    searchBtn.click();
                  }
                }, 100);
              }}
            >
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <path
                  d="M17 1.63635L10.0909 8.54544L6.45455 4.90908L1 10.3636"
                  stroke="#6D6D6D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.6367 1.63635H17.0004V5.99999"
                  stroke="#6D6D6D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* <span className="mr-3">{item.icon}</span> */}
              <div className="flex items-center">
                <span className="text-sm ml-2 text-gray-700">{item.text}</span>
                <svg
                  className="w-4 h-4 ml-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          id="search-btn-home"
          className="w-[90vw] rounded-md mt-3 cursor-pointer outline-none none text-xl inline text-white bg-[#3042fb]  max-w-[750px] h-[55px] font-[1000]"
          onClick={handleClick}
        >
          <Link
            id="searchBtnLink"
            href={"/" + url.split("?")[0] + "?search_from=home"}
            target={redirectToAmazon ? "_blank" : "_self"}
            style={{
              pointerEvents: url ? "auto" : "none",
            }}
          ></Link>
          Procurar
        </button>
      </div>

      <div className="flex items-center mb-4 mt-2 mx-auto w-[90vw] max-w-[750px]">
        <input
          checked={redirectToAmazon}
          id="default-checkbox"
          type="checkbox"
          value=""
          className="w-4 h-4 text-[#3042FB] accent-[#3042FB] bg-gray-100 border-gray-300 rounded-xl  cursor-pointer"
          onChange={(e) => setRedirectToAmazon(e.target.checked)}
        />
        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Procurar na Amazon também
        </label>
      </div>
    </div>
  );
};

export default SearchButton;
