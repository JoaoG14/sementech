"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const OfferEditor = () => {
  const [productInfo, setProductInfo]: any = useState();
  const [offersData, setOffersData]: any = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const productId = usePathname().slice(14);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getData = async () => {
      try {
        let { data: searches, error } = await supabase
          .from("searches")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;

        if (searches) {
          setProductInfo(searches);
          // Parse the offers if it's a string
          const offersData =
            typeof searches.offers === "string"
              ? JSON.parse(searches.offers)
              : searches.offers;

          // Combine all offers arrays into one
          const combinedOffers = [
            ...(offersData[0] || []),
            ...(offersData[1] || []),
            ...(offersData[2] || []),
          ];
          setOffersData(combinedOffers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [productId]);

  const handleProductUpdate = (field: string, value: string) => {
    setProductInfo((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleOfferUpdate = (offerIndex: number, updatedOffer: any) => {
    const newOffersData = [...offersData];
    newOffersData[offerIndex] = updatedOffer;
    setOffersData(newOffersData);
    setHasChanges(true);
  };

  const handleDeleteOffer = (index: number) => {
    const newOffersData = offersData.filter((_: any, i: number) => i !== index);
    setOffersData(newOffersData);
    setHasChanges(true);
  };

  const handleAddOffer = () => {
    const newOffer = {
      thumbnail: "",
      title: "",
      price: "",
      link: "",
      source: "",
      position: offersData.length + 1,
    };
    setOffersData([...offersData, newOffer]);
    setHasChanges(true);
  };

  const handleMoveOffer = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= offersData.length) return;

    const newOffersData = [...offersData];
    const [movedOffer] = newOffersData.splice(fromIndex, 1);
    newOffersData.splice(toIndex, 0, movedOffer);

    // Update positions
    const updatedOffersData = newOffersData.map((offer, index) => ({
      ...offer,
      position: index + 1,
    }));

    setOffersData(updatedOffersData);
    setHasChanges(true);
  };

  const validatePassword = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password !== process.env.NEXT_PUBLIC_OFFER_CREATION_PASSWORD) {
      setError("Incorrect password");
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    setError("");
    if (!validatePassword()) {
      return;
    }

    setIsSaving(true);
    try {
      // Split offers into three equal parts
      const chunkSize = Math.ceil(offersData.length / 3);
      const offersArray = [
        offersData.slice(0, chunkSize),
        offersData.slice(chunkSize, chunkSize * 2),
        offersData.slice(chunkSize * 2),
      ];

      // Prepare the update data according to the table schema
      const updateData = {
        id: productId,
        product_url: productInfo.product_url || null,
        img: productInfo.img || null,
        title: productInfo.title || null,
        price: productInfo.price || null,
        source: productInfo.source || null,
        offers: offersArray,
        cache: productInfo.cache !== undefined ? productInfo.cache : false,
      };

      console.log("Data being sent to Supabase:", {
        id: updateData.id,
        product_url: updateData.product_url,
        title: updateData.title,
        price: updateData.price,
        source: updateData.source,
        offersLength: offersArray.length,
        offersFirstItem: offersArray[0]?.[0],
      });

      const { error: supabaseError } = await supabase
        .from("searches")
        .upsert(updateData, {
          onConflict: "id",
        });

      if (supabaseError) {
        console.error("Supabase Error Details:", {
          code: supabaseError.code,
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
        });
        throw new Error(
          `Failed to save changes: ${supabaseError.message}${
            supabaseError.details ? ` (${supabaseError.details})` : ""
          }`
        );
      }

      setHasChanges(false);
      setPassword(""); // Clear password after successful save
      alert("Changes saved successfully!");
    } catch (error: any) {
      console.error("Full error object:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offer Editor</h1>
        <div className="flex items-center gap-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="px-4 py-2 border rounded"
          />
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-6 py-2 rounded-lg text-white font-semibold ${
              hasChanges
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            } ${isSaving ? "opacity-50 cursor-wait" : ""}`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img
              src={productInfo?.img}
              alt={productInfo?.title}
              className="max-w-[300px] h-auto"
            />
            <input
              type="text"
              value={productInfo?.img || ""}
              onChange={(e) => handleProductUpdate("img", e.target.value)}
              className="w-full p-2 border rounded mt-2"
              placeholder="Image URL"
            />
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Title:</p>
              <input
                type="text"
                value={productInfo?.title || ""}
                onChange={(e) => handleProductUpdate("title", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Product Title"
              />
            </div>
            <div>
              <p className="font-semibold mb-1">Price:</p>
              <input
                type="text"
                value={productInfo?.price || ""}
                onChange={(e) => handleProductUpdate("price", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Product Price"
              />
            </div>
            <div>
              <p className="font-semibold mb-1">Source:</p>
              <input
                type="text"
                value={productInfo?.source || ""}
                onChange={(e) => handleProductUpdate("source", e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Product Source"
              />
            </div>
            <div>
              <p className="font-semibold mb-1">Product URL:</p>
              <input
                type="text"
                value={productInfo?.product_url || ""}
                onChange={(e) =>
                  handleProductUpdate("product_url", e.target.value)
                }
                className="w-full p-2 border rounded"
                placeholder="Product URL"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Offers</h2>
          <button
            onClick={handleAddOffer}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Offer
          </button>
        </div>
        <div className="space-y-4">
          {offersData.map((offer: any, index: number) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <img
                    src={offer.thumbnail}
                    alt={offer.title}
                    className="max-w-[200px] h-auto"
                  />
                  <input
                    type="text"
                    value={offer.thumbnail || ""}
                    onChange={(e) => {
                      const updatedOffer = {
                        ...offer,
                        thumbnail: e.target.value,
                      };
                      handleOfferUpdate(index, updatedOffer);
                    }}
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Thumbnail URL"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Position: {index + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveOffer(index, "up")}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveOffer(index, "down")}
                        disabled={index === offersData.length - 1}
                        className={`p-1 rounded ${
                          index === offersData.length - 1
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={offer.title}
                    onChange={(e) => {
                      const updatedOffer = { ...offer, title: e.target.value };
                      handleOfferUpdate(index, updatedOffer);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={offer.price}
                    onChange={(e) => {
                      const updatedOffer = { ...offer, price: e.target.value };
                      handleOfferUpdate(index, updatedOffer);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Price"
                  />
                  <input
                    type="text"
                    value={offer.link}
                    onChange={(e) => {
                      const updatedOffer = { ...offer, link: e.target.value };
                      handleOfferUpdate(index, updatedOffer);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Link"
                  />
                  <input
                    type="text"
                    value={offer.source}
                    onChange={(e) => {
                      const updatedOffer = { ...offer, source: e.target.value };
                      handleOfferUpdate(index, updatedOffer);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Source"
                  />
                </div>
                <div>
                  <button
                    onClick={() => handleDeleteOffer(index)}
                    className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferEditor;
