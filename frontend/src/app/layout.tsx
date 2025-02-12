import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "@/context/AuthContext";
import NavBar from "@/components/layout/navbar";
import BottomNavBar from "@/components/layout/bottom-nav";
import React from "react";
import Sidebar from "@/components/layout/right-sidebar";
import LeftSideBar from "@/components/layout/left-sidebar";

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
          <div className="flex ">
            <div className="hidden lg:block fixed left-48 top-28 h-full w-64 z-10">
              <LeftSideBar />
            </div>
            <div className="flex-1 overflow-y-auto h-screen mt-28 flex justify-center">
              <div className="max-w-2xl">{children}</div>
            </div>
            <div className="hidden lg:block fixed right-60 top-28 h-full w-64 bg-white z-10">
              <Sidebar />
            </div>
          </div>
          <BottomNavBar />
        </UserContextProvider>
      </body>
    </html>
  );
}
