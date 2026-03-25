import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AppToaster from "@/components/providers/AppToaster";
// import AppBootstrap from "@/components/providers/AppBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keynou Drive",
  description:
    "Keynou Drive is the modern branded URL shortener for teams that want custom short links, deep analytics, custom domains, and branded redirects with total control.",
  keywords: [
    "url shortener",
    "branded url shortener",
    "cheap url shortener",
    "cheap branded url shortener",
    "free url shortener",
    "better url shortener",
    "new url shortener",
    "custom short links",
    "short link analytics",
    "custom domains",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          {children}
          <AppToaster />
          {/* <AppBootstrap /> */}
        </ReduxProvider>
      </body>
    </html>
  );
}
