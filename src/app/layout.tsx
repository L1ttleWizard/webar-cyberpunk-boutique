import type { Metadata, Viewport } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether AR | Cyberpunk Boutique",
  description: "High-fidelity mobile WebAR cybernetic accessories try-on boutique built with Next.js, Redux, and MindAR.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full select-none antialiased bg-black text-slate-100`}
    >
      <body className="h-full w-full overflow-hidden bg-black flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
