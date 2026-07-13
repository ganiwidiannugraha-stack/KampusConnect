import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

import { Toaster } from "sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavigationProgress } from "@/components/NavigationProgress";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KampusConnect",
  description: "Sistem Informasi Reservasi Ruang Organisasi Kampus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link href="/logo.png" rel="icon" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <NavigationProgress />
          {/* Global Cosmic Background */}
          <div className="fixed inset-0 z-[-1] bg-zinc-50 dark:bg-[#050505] overflow-hidden pointer-events-none">
            {/* Massive Top Glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[80vh] bg-primary/40 dark:bg-primary/30 blur-[120px] rounded-[100%] pointer-events-none"></div>
          </div>

          <div className="relative z-0 min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <ScrollToTop />
          </div>
          <Toaster position="top-center" richColors />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
