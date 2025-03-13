import type { Metadata } from "next";
import "./globals.css";
import Footer from "./components/Footer";
import { CSPostHogProvider } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Achar.promo - Economize Mais em Menos Tempo",
  description: "Ache produtos iguais ou similares por preços menores.",
  openGraph: {
    title: "Achar.promo",
    description: "Ache produtos iguais ou similares por preços menores.",
    siteName: "Achar.promo",
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
      <CSPostHogProvider>
        <body className={inter.className}>
          {/* <AuthProvider> */}
          <main className="min-h-[100vh] font-Mulish">{children}</main>

          <footer>
            <Footer />
          </footer>
          {/* </AuthProvider> */}
          <Analytics />
          <Toaster position="bottom-center" />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
