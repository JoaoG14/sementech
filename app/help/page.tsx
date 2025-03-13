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
    navigator.clipboard.writeText("contato@sementec.com.br");
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
      <section className="bg-gray-50 font-Mulish min-h-screen">
        <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
          <h2 className="mb-4 text-4xl tracking-tight font-black text-gray-900">
            Fale com Nossos Especialistas em Sementes
          </h2>
          <p className="mb-8 lg:mb-6 font-medium text-gray-600 sm:text-xl leading-relaxed">
            Tem dúvidas sobre nossas sementes? Precisa de conselhos de cultivo?
            Quer saber mais sobre nossa certificação orgânica? Envie sua
            mensagem abaixo e nossos especialistas em jardinagem entrarão em
            contato.
          </p>
          <p className="mb-8 font-medium text-gray-600 sm:text-xl">
            Você também pode nos enviar um e-mail diretamente para{" "}
            <span className="flex items-center gap-2">
              <a
                href="mailto:contato@sementec.com.br"
                className="text-[#15803D] hover:text-[#126832] hover:underline"
              >
                contato@sementec.com.br
              </a>
              <button
                id="copyButton"
                onClick={copyEmail}
                className="px-3 py-1 text-sm bg-[#15803D]/10 text-[#15803D] rounded-md hover:bg-[#15803D]/20 transition-colors"
              >
                Copiar
              </button>
            </span>
          </p>
          <form action="#" className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Seu E-mail
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#15803D] focus:border-[#15803D] block w-full p-2.5"
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
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Sua Mensagem
              </label>
              <textarea
                id="message"
                rows={6}
                className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg shadow-sm border border-gray-300 focus:ring-[#15803D] focus:border-[#15803D]"
                placeholder="Compartilhe suas dúvidas sobre nossas sementes, dicas de cultivo necessárias ou qualquer outra pergunta..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              ></textarea>
            </div>
            <span
              id="messageSent"
              className="hidden my-0 py-0 text-[#15803D] font-medium"
            >
              Sua mensagem foi enviada! Entraremos em contato em breve.
            </span>
            <button
              type="submit"
              className="py-3 px-5 text-base font-bold text-center text-white bg-[#15803D] rounded-lg hover:bg-[#126832] transition-colors focus:ring-4 focus:ring-[#15803D]/20 focus:outline-none"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Help;
