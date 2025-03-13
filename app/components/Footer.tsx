import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#3042FB] relative  flex font-Mulish max-w-[90w] xl:rounded-lg  xl:max-w-screen-lg px-3 xl:mx-auto xl:mb-3">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="https://www.achar.promo/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center text-3xl font-black whitespace-nowrap text-white">
              achar.promo
            </span>
          </a>
          <ul className="flex flex-wrap items-center  font-medium text-white sm:mb-0 ">
            <li>
              <a href="/" className="hover:underline me-4 md:me-6">
                Início
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/pexinxascom"
                target="_blank"
                className="hover:underline me-4 md:me-6"
              >
                Twitter
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
            {/* <li>
              <a href="/blog" className="hover:underline">
                Blog
              </a>
            </li> */}
          </ul>
        </div>
        <hr className="my-6  border-gray-300 sm:mx-auto  lg:my-8" />
        <span className="block text-sm mb-2 text-white sm:text-center ">
          © 2025{" "}
          <a href="https://www.pexinxas.com/" className="hover:underline">
            achar.promo™
          </a>
          . Todos Direitos Reservados.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
