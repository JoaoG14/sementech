import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SemenTech - Encontre sementes de alta qualidade",
  description: "Encontre sementes de alta qualidade.",
  openGraph: {
    title: "SemenTech",
    description: "Encontre sementes de alta qualidade.",
    siteName: "SemenTech",
    type: "website",
    locale: "pt_BR",
    images: {
      url: "https://ik.imagekit.io/pexinxas/pexinxas/Assets/meta-image.png",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* <AuthProvider> */}
        <main className="min-h-[100vh] font-Mulish">{children}</main>

        <footer>
          <Footer />
        </footer>
        {/* </AuthProvider> */}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
