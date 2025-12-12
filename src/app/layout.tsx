import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go2Grocer | Fresh Groceries Delivered in Chittagong",
  description: "Order fresh vegetables, fruits, fish, meat, and daily essentials online in Chittagong. Fast delivery in 30-60 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
