import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Milagros Fitness",
    template: "%s — Milagros Fitness",
  },
  description:
    "Tu biblioteca de clases de flexibilidad, movilidad, fuerza y entrenamiento.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Milagros Fitness",
    title: "Milagros Fitness",
    description:
      "Tu biblioteca de clases de flexibilidad, movilidad, fuerza y entrenamiento.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Milagros Fitness",
    description:
      "Tu biblioteca de clases de flexibilidad, movilidad, fuerza y entrenamiento.",
  },
  alternates: {
    canonical: appUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col">
        {children}
        <CookieBanner />
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
