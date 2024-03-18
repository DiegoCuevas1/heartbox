'use client';
import SignInSignUp from "./SignUpSignIn"
import HomeSignupButton from "@/components/HomeSignupButton"
import { useUserContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react";

function Hero() {
  

  return(
    <main>
      {/* <div className="flex h-[240px] relative bg-gradient-to-r from-[#fde9f1] via-[#ff2345] to-[#fde9f1]"> */}
      <div style={{ background: 'radial-gradient(142% 50.55% at 0% 34.29%, rgba(255, 0, 40, 0.40) 0%, rgba(253, 233, 241, 1) 100%)'}} className="flex h-[240px] relative">
        <div className="flex mx-auto">
          <div className="flex flex-col p-6">
            <h1 className="w-44 text-white text-3xl font-bold drop-shadow-2xl text-shadow font-['Seguoe UI']">Welcome to Heartbox</h1>
            <HomeSignupButton />
            <p className="w-[177px] h-9 text-white text-shadow text-sm font-normal font-['Seguoe UI']">Start adding to your own Heartboxes by signing up.</p>
          </div>
          <img src="https://placehold.co/137x122" className="w-36"/>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  const { authStatus } = useUserContext();
  const router = useRouter();
  useEffect(() => {
    if (authStatus) {
      router.push('/families');
    }
  }, [authStatus, router]);

    return (
    <div className="">
      <Hero />
      <SignInSignUp />
      
    </div>
    )
}
