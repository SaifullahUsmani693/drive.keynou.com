import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AppToaster from "@/components/providers/AppToaster";
import AppBootstrap from "@/components/providers/AppBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keynou Drive | Branded URL Shortener for SaaS Teams",
  description:
    "Launch premium short links with custom domains, branded splash screens, and live analytics. Keynou Drive gives SaaS marketing, growth, and ops teams total control over every redirect.",
  keywords: [
    "url shortener for SaaS",
    "branded url shortener",
    "custom short links",
    "enterprise short link platform",
    "marketing analytics",
    "short link analytics",
    "custom domains",
    "link tracking",
    "growth marketing tools",
  ],
  openGraph: {
    title: "Keynou Drive – Premium Short Links for Modern Teams",
    description:
      "Create branded short links, review cap requests, and monitor real-time analytics across every domain you manage.",
    url: "https://drive.keynou.com",
    siteName: "Keynou Drive",
    images: [
      {
        url: "https://drive.keynou.com/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Keynou Drive dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keynou Drive | Branded URL Shortener",
    description:
      "Shorten, brand, and track every link with custom domains, cap approvals, and Celery-powered analytics processing.",
    images: ["https://drive.keynou.com/og-preview.png"],
  },
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
          <AppBootstrap />
          {children}
          <AppToaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
