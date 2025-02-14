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

import MainContent from "@/components/layout/main-content";
import { NotificationProvider } from "@/context/NotificationContext";

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
      <body className={`bg-main ${inter.className} overflow-hidden`}>
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
          <NotificationProvider>
            <div className="fixed top-0 left-0 right-0 z-50">
              <NavBar />
            </div>

            <div className="flex h-screen pt-28">
              {/* Left Sidebar - only show on xl and up */}
              <div className="hidden xl:block fixed left-24 top-28 bottom-16 w-72">
                <div className="h-full">
                  <LeftSideBar />
                </div>
              </div>

              {/* Main Content - scrollable */}
              <MainContent>{children}</MainContent>

              {/* Right Sidebar - only show on xl and up */}
              <div className="hidden xl:block fixed right-24 top-28 bottom-16">
                <div className="h-full">
                  <Sidebar />
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50">
              <BottomNavBar />
            </div>
          </NotificationProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
