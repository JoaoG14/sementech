import React from "react";

interface SelectedOfferInfo {
  originalUrl: string;
  originalImg: string;
  originalPrice: number;
  offerUrl: string;
  offerImg: string;
  offerPrice: number;
}

interface SelectedOfferProps {
  selectedOfferInfo: SelectedOfferInfo;
}

const SelectedOffer: React.FC<SelectedOfferProps> = ({ selectedOfferInfo }) => {
  return (
    <div className="flex mx-auto  max-w-[450px] mb-1 w-[90vw] border-2 border-[#C1C1C1] rounded-lg text-left">
      <div className="grid grid-cols-2 gap-2.5 p-2.5">
        <div className="">
          <a
            href={selectedOfferInfo.originalUrl}
            target="_blank"
            className="flex aspect-square rounded-md border-[#C1C1C1] border-[2px]"
          >
            <img
              className="rounded-[4px] my-auto"
              src={selectedOfferInfo.originalImg}
            />
          </a>

          <a
            href={selectedOfferInfo.originalUrl}
            target="_blank"
            className="mt-2 min-[400px]:text-xl inline-block bg-[#1d1d1d] px-2.5 max-h-[40px] py-1.5 mr-2 text-md cursor-default font-black  rounded-md text-white "
          >
            R$ {selectedOfferInfo.originalPrice}
          </a>
        </div>
        <div className="">
          <a
            href={selectedOfferInfo.offerUrl}
            target="_blank"
            className="flex aspect-square rounded-md border-[#C1C1C1] border-[2px]"
          >
            <img
              className="ml-0 my-auto rounded-[4px]"
              src={selectedOfferInfo.offerImg}
            />
          </a>
          <div className="flex">
            <a
              href={selectedOfferInfo.offerUrl}
              target="_blank"
              className="mt-2 min-[400px]:text-xl inline-block bg-[#FF2E12] px-2.5 max-h-[40px] py-1.5 mr-2 text-md cursor-default font-black  rounded-md text-white"
            >
              R$ {selectedOfferInfo.offerPrice}
            </a>
            <a className="mt-[17px] inline-block text-xl font-black truncate leading-none text-[#FF2E12]">
              -
              {Math.floor(
                (Number(String(selectedOfferInfo.originalPrice).replace(".","")) -
                  Number(String(selectedOfferInfo.offerPrice).replace('.', ""))) /
                  (Number(String(selectedOfferInfo.originalPrice).replace(".","")) / 100)
              )}
              %
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedOffer;
