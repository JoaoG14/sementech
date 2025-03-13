import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-gray-50 relative flex font-Mulish max-w-[90w] ">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-10">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center text-2xl font-black whitespace-nowrap text-[#7DCB2D]">
              SEMENTEC
            </span>
          </a>
          <ul className="flex flex-wrap items-center  text-black sm:mb-0">
            <li>
              <a href="/" className="hover:underline me-4 md:me-6">
                Início
              </a>
            </li>
            <li>
              <a
                href="#"
                target="_blank"
                className="hover:underline me-4 md:me-6"
              >
                Blog
              </a>
            </li>
            <li>
              <a href="/help" className="hover:underline me-4 md:me-6">
                Ajuda
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline me-4 md:me-6">
                Termos
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-[#929292] sm:mx-auto lg:my-8" />
        <span className="block text-sm mb-2 text-black sm:text-center">
          © 2024{" "}
          <a href="/" className="hover:underline">
            Sementech™
          </a>
          . Todos Direitos Reservados.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
