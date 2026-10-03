import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import { APP_NAME, APP_SUBTITLE } from "@/config/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_SUBTITLE,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        {/* Skip to main content — aksesibilitas */}
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>

        {/*
         * AppProvider menyediakan context untuk:
         *   - currentUser (dummy — TODO: ganti dengan auth session)
         *   - mobile sidebar state
         */}
        <AppProvider>
          <MainLayout>{children}</MainLayout>
        </AppProvider>
      </body>
    </html>
  );
}
