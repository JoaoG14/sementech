"use client";

import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { createClient } from "@supabase/supabase-js";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { apiBaseUrl } from "../shared";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const OfferRequest = () => {
  const [img, setImg] = useState<string>("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [desiredPrice, setDesiredPrice] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsUploading(false);
  };

  const onSuccess = (res: any) => {
    if (uploadedImageUrls.length < 3) {
      setUploadedImageUrls((prev) => [...prev, res.url]);
    }
    setIsUploading(false);
  };

  const handleImageClick = () => {
    if (uploadedImageUrls.length < 3) {
      const imageInput: any = document.getElementById("imageInput");
      setIsUploading(true);
      imageInput.click();
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImageUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("offer_requests").insert([
        {
          img: uploadedImageUrls,
          name,
          price,
          desired_price: desiredPrice,
          email,
        },
      ]);

      if (error) throw error;

      // Clear form after successful submission
      setImg("");
      setName("");
      setPrice("");
      setDesiredPrice("");
      setUploadedImageUrls([]);

      window.location.href = "/offer-published";
    } catch (error) {
      console.error("Error inserting data:", error);
      alert("Erro ao fazer publicaçã. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="mx-auto w-[90vw] mt-12 max-w-[700px]">
        <h2 className="px-1 font-black text-xl">Termine sua publicação</h2>
        <div className="px-1 max-w-[450px]">
          Já preenchemos alguns dados sobre o produto que você esta procurando,
          basta completar o que falta.
        </div>
        <label className="font-black px-1 text-lg block py-2">
          Imagem{" "}
          <span className="text-[#8c8c8c] text-base font-bold">
            {uploadedImageUrls.length} / 3
          </span>
        </label>
        <div className="flex items-center gap-2">
          {uploadedImageUrls.map((url, index) => (
            <div
              key={index}
              className="relative rounded-xl h-20 w-20 border-[#c1c1c1] bg-[#F5F5F5] border-[1px] flex items-center justify-center overflow-hidden"
            >
              <img src={url} className="h-20 w-20 object-cover" />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
              >
                <img src="/close.png" className="w-3 h-3" />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="rounded-xl h-20 w-20 border-[#c1c1c1] bg-[#F5F5F5] border-[1px] flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-transparent animate-spin fill-[#3042FB]"
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
            </div>
          )}
          {uploadedImageUrls.length < 3 && !isUploading && (
            <div
              id="imageUpload"
              className="rounded-xl h-20 w-20 border-[#c1c1c1] bg-[#F5F5F5] border-[1px] flex items-center justify-center cursor-pointer"
              onClick={handleImageClick}
            >
              <img src="/plusCircle.png" id="imgUploadBtn" className="w-8" />
            </div>
          )}
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
        </div>

        <label className="font-black px-1 text-lg block py-2">
          Nome do produto
        </label>
        <input
          className="rounded-md w-full p-2 bg-[#F5F5F5] border-[#c1c1c1] border-[1px]"
          type="text"
          placeholder="Ex: iPhone 16 pro 256gb"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="font-black px-1 text-lg block py-2">
          Preço do produto
        </label>
        <input
          className="rounded-md w-full p-2 bg-[#F5F5F5] border-[#c1c1c1] border-[1px]"
          type="text"
          placeholder="Ex: R$ 5999,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <label className="font-black px-1 text-lg block py-2">
          Quanto você quer pagar?{" "}
          <span className="text-[#8c8c8c] font-bold">(opcional)</span>
        </label>
        <input
          className="rounded-md w-full p-2 bg-[#F5F5F5] border-[#c1c1c1] border-[1px]"
          type="text"
          placeholder="Ex: R$ 4999,00"
          value={desiredPrice}
          onChange={(e) => setDesiredPrice(e.target.value)}
        />

        <label className="font-black px-1 text-lg block py-2">Seu Email</label>
        <input
          className="rounded-md w-full p-2 bg-[#F5F5F5] border-[#c1c1c1] border-[1px]"
          type="email"
          placeholder="Ex: maria@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full rounded-md mt-10 cursor-pointer outline-none none text-xl inline text-white bg-[#3042fb]  max-w-[750px] h-[55px] font-[1000]"
        >
          {isSubmitting ? (
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-white animate-spin"
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
          ) : (
            "Postar"
          )}
        </button>
      </div>
    </div>
  );
};

export default OfferRequest;
