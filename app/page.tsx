import DemoVideo from "./components/DemoVideo";
import Footer from "./components/Footer";
import HomepagePicks from "./components/HomepagePicks";
import Recommended from "./components/Recommended";
import SearchButton from "./components/SearchButton";
import TopBar from "./components/TopBar";
import LoginButton from "./components/LoginButton";
import SelectedOffer from "./components/SelectedOffer";
import confirmationChatBubble from "./confirmationChatBubble.jpg";

export const fetchCache = "default-no-store";

export default function Home() {
  return (
    <div className="font-Mulish">
      <TopBar></TopBar>
      {/* Permanently disabled login button for now */}
      {/* <LoginButton /> */}

      <div className="mt-36  mb-[136px] text-center">
        <h1 className="font-[1000] text-[#3042FB] text-5xl lg:text-7xl mb-4 ">
          achar.promo
        </h1>
        <p className="text-gray-900 lg:text-lg font-bold mb-7">
          Ache produtos parecidos por preços menores
        </p>

        <SearchButton />

        {/* <DemoVideo /> */}

        <Recommended />
      </div>
    </div>
  );
}
