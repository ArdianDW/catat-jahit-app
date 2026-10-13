import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import NavigationProgress from "@/components/NavigationProgress";
import ViewTransitionsProvider from "@/components/ViewTransitionsProvider";
import NetworkStatusBanner from "@/components/NetworkStatusBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#6B8F71",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CatatJahit",
  description: "Aplikasi pencatatan pesanan jahit dan permak",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CatatJahit",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6EE]">
        <NavigationProgress />
        <ViewTransitionsProvider />
        <NetworkStatusBanner />
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
