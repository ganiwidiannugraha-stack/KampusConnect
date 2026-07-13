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
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
          <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.15), transparent 70%)' }}></div>

          <div className="relative z-0 min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col">
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
