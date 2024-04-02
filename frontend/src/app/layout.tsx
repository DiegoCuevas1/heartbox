import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "@/context/AuthContext";
import NavBar from '@/components/layout/navbar';
import BottomNavBar from '@/components/layout/bottom-nav';


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
      <body className={inter.className}>
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
