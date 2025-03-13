import Recommended from "./components/Recommended";
import SearchButton from "./components/SearchButton";

export const fetchCache = "default-no-store";

export default function Home() {
  return (
    <div className="font-Mulish bg-gray-50 min-h-screen">
      {/* Permanently disabled login button for now */}
      {/* <LoginButton /> */}

      <div id="home" className="flex flex-col items-center justify-center py-10">
        <SearchButton />
        
        {/* Recommended section with proper spacing */}
        <div className="w-full max-w-7xl mx-auto px-4 mt-8">
          {/* <Recommended /> */}
        </div>
      </div>
    </div>
  );
}
