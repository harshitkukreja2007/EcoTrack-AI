import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { EcoProvider } from "@/context/EcoContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EcoTrack AI | Futuristic Carbon Tracker & Sustainability Engine",
  description: "Calculate, analyze, and reduce your carbon footprint with AI insights, gamified challenges, and real-time sustainability metrics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-eco-bg text-gray-100 font-sans selection:bg-eco-green/30 selection:text-eco-green-light">
        <EcoProvider>
          {children}
        </EcoProvider>
      </body>
    </html>
  );
}
