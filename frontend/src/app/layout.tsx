import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "@/context/AuthContext";
import NavBar from '@/components/layout/navbar';
import BottomNavBar from '@/components/layout/bottom-nav';
import React from 'react';
import Head from 'next/head';



const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HeartBox App',
  description: 'created by Diego Cuevas, Rob Mantovani, Kyle Mantovani',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <title>HeartBox App</title>
        <meta name="description" content="created by Diego Cuevas, Rob Mantovani, Kyle Mantovani" />
        {/* Include Google Sign-In JavaScript SDK */}
        <script src="https://apis.google.com/js/platform.js" async defer></script>
        {/* Add any other meta tags or link tags here */}
      </Head>
      <body className={`bg-main ${inter.className}`}>
        <Toaster
        position="top-left"
        reverseOrder={false}
         />
        <UserContextProvider>
          <NavBar />
          <div className='pt-28'>{children}</div>
          <BottomNavBar />
        </UserContextProvider>
      </body>
    </html>
  )
}
