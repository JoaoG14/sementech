import React from "react";
import WhatsappForm from "../components/WhatsappForm";

const OfferPublished = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl w-[400px] font-black mb-4">
        Sua publicação foi postada na comunidade!
      </h1>

      <div className="flex items-center justify-center mb-4">
        <div className="bg-blue-500 rounded-full h-16 w-16 flex items-center justify-center">
          <span className="text-white text-3xl">✔️</span>
        </div>
      </div>
      <p className="text-gray-600 w-[400px] mb-4 font-bold">
        Enviaremos um email para você quando alguma oferta para esse produto for
        postada
      </p>
      <a
        href="/"
        className="max-w-[420px] rounded-md mt-4 cursor-pointer outline-none text-xl text-white bg-[#3042fb] w-[90%] h-[55px] font-[1000] flex items-center justify-center"
      >
        Voltar ao início
      </a>
    </div>
  );
};

export default OfferPublished;
