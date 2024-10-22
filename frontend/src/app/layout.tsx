import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "@/context/AuthContext";
import NavBar from "@/components/layout/navbar";
import BottomNavBar from "@/components/layout/bottom-nav";
import React from "react";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeartBox App",
  description: "created by Diego Cuevas, Rob Mantovani, Kyle Mantovani",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>HeartBox App</title>
        <meta
          name="description"
          content="created by Diego Cuevas, Rob Mantovani, Kyle Mantovani"
        />
      </Head>
      <body className={`bg-main ${inter.className}`}>
        <Toaster
          position="top-left"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#d31c60",
              color: "white",
            },
            success: {
              iconTheme: {
                primary: "white",
                secondary: "#D31c60",
              },
            },
            error: {
              iconTheme: {
                primary: "white",
                secondary: "#D31C60",
              },
            },
          }}
        />
        <UserContextProvider>
          <NavBar />
          <div className="pt-28">{children}</div>
          <BottomNavBar />
        </UserContextProvider>
      </body>
    </html>
  );
}
