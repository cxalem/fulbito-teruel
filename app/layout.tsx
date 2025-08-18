import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fulbito Teruel",
  description: "Aplicación para gestionar partidos de fútbol en Teruel. Encuentra y únete a partidos de fútbol en tu ciudad.",
  keywords: ["fútbol", "teruel", "partidos", "deporte", "equipos", "jugar"],
  authors: [{ name: "Fulbito Teruel" }],
  creator: "Fulbito Teruel",
  publisher: "Fulbito Teruel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Fulbito Teruel",
    description: "Aplicación para gestionar partidos de fútbol en Teruel. Encuentra y únete a partidos de fútbol en tu ciudad.",
    url: "/",
    siteName: "Fulbito Teruel",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fulbito Teruel",
    description: "Aplicación para gestionar partidos de fútbol en Teruel. Encuentra y únete a partidos de fútbol en tu ciudad.",
    creator: "@fulbitoteruel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin } = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar user={user} isAdmin={isAdmin} />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
