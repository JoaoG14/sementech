"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import Timer from "./Timer";
import { useRouter } from "next/navigation";
import confirmationChatBubble from "../confirmationChatBubble.jpg";
import chatMoreOffers from "../chatMoreOffers.jpg";

import chatBubble from "../chatBubble.jpg";
import Image from "next/image";
import SearchButton from "./SearchButton";
import PocketBase from "pocketbase";

interface search {
  searchFailed: boolean;
}

const WhatsappForm: React.FC<search> = ({ searchFailed }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productUrl = pathname.slice(1) + "?" + searchParams;
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const url = "https://pexinxas.pockethost.io/";
  const client = new PocketBase(url);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitButton: any = document.getElementById("submitButton");
    const searchButton: any = document.getElementById("searchButton");
    const numberForm: any = document.getElementById("numberForm");
    const whatsappInput: any = document.getElementById("whatsappInput");
    const chatImage: any = document.getElementById("chatBubble");
    const confirmedChatImage: any = document.getElementById(
      "confirmationChatBubble"
    );

    if (!phone) {
      whatsappInput.placeholder = "Por favor digite seu número";
      return;
    }

    submitButton.innerHTML = `
    <div class="text-center">
      <div role="status">
        <svg aria-hidden="true" class="inline w-8 h-8 text-transparent animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    
    `;

    const data = {
      productUrl: productUrl,
      phone: phone,
    };

    const record = await client.collection("whatsappRequests").create(data);

    chatImage.style.display = "none";
    confirmedChatImage.style.display = "block";
    numberForm.style.display = "none";
    whatsappInput.style.display = "none";
    searchButton.style.display = "block";
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-[450px]">
        <Image
          id="chatBubble"
          src={searchFailed ? chatBubble : chatMoreOffers}
          alt="Foi mal amigo(a), ainda não achamos ofertas para esse produto, mas se quiser você pode dar uma olhada no nosso telegram."
          className="mb-10 max-w-[450px] w-screen text-center mx-auto"
        />
        <div className="flex justify-center">
          <a
            href="/offer-request"
            className="rounded-md max-w-[450px] w-[90%] cursor-pointer outline-none text-xl text-white bg-[#3042fb] h-[55px] font-[1000] flex items-center justify-center"
          >
            Postar na comunidade
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhatsappForm;
