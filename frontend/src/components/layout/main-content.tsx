"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";

  return (
    <main className="flex-1 overflow-y-auto min-h-screen flex justify-center">
      <div
        className={`w-full px-4 xl:px-0 ${!isHomePage && "max-w-2xl xl:max-w-3xl"}`}
      >
        <div className={`pb-36 mx-auto w-full ${!isHomePage && "max-w-2xl"}`}>
          {children}
        </div>
      </div>
    </main>
  );
}
