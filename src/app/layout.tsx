import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

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
            <body className={`${inter.variable}`} suppressHydrationWarning>
                <a href="#main-content" className="sr-only">
                    Skip to main content
                </a>
                <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
