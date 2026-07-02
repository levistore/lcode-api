import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { ThemeProvider } from "@/context/ThemeContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lcode API — Powerful APIs for Modern Applications",
  description:
    "Lcode API provides fast, secure, and scalable APIs for developers. Get started with enterprise-grade endpoints in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geist.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.className = document.documentElement.className
                  .split(' ')
                  .filter(c => c !== 'light' && c !== 'dark')
                  .join(' ') + ' ' + theme;
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary md:pb-0 relative overflow-x-hidden">
        <ThemeProvider>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
