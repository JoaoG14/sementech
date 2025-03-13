"use client";

import React, { useState, FormEvent } from "react";
import NavBar from "../components/NavBar";
import PocketBase from "pocketbase";

const Help = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const dbUrl = "https://pexinxas.pockethost.io/";
  const client = new PocketBase(dbUrl);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageSent: any = document.querySelector("#messageSent");

    const data = {
      email: email,
      message: message,
    };

    const record = await client.collection("help").create(data);
    messageSent.style.display = "block";
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("contato@achar.promo");
    const copyButton = document.getElementById("copyButton");
    if (copyButton) {
      copyButton.textContent = "Copiado!";
      setTimeout(() => {
        copyButton.textContent = "Copiar";
      }, 2000);
    }
  };

  return (
    <div>
      <NavBar />
      <section className="bg-white font-Mulish mt-10">
        <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
          <h2 className="mb-4 text-4xl tracking-tight font-black  text-gray-900 ">
            Entre em contato
          </h2>
          <p className="mb-8 lg:mb-6 font-medium  text-gray-500  sm:text-xl">
            Algum problema técnico? Quer mandar feedback sobre o site? Quer mais
            informações sobre nosso negócio? Mande sua mensagem abaixo.
          </p>
          <p className="mb-8 font-medium text-gray-500 sm:text-xl">
            Se preferir pode enviar um email para{" "}
            <span className="flex items-center gap-2">
              <a
                href="mailto:contato@achar.promo"
                className="text-[#3042fb] hover:underline"
              >
                contato@achar.promo
              </a>
              <button
                id="copyButton"
                onClick={copyEmail}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Copiar
              </button>
            </span>
          </p>
          <form action="#" className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Seu email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Sua mensagem
              </label>
              <textarea
                id="message"
                rows={6}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Deixe um comentário..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              ></textarea>
            </div>
            <span id="messageSent" className=" hidden my-0 py-0 text-green-500">
              Sua mensagem foi enviada!
            </span>
            <button
              type="submit"
              className="py-3 px-5 text-base font-bold text-center bg-[#3042fb] text-white rounded-lg bg-primary-700 sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300"
            >
              Enviar mensagem
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Help;
