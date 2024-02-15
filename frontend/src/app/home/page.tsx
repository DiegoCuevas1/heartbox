import Link from "next/link"
import Logout from "@/components/logoutbtn"
import Button from "@/components/button"
import SignInSignUp from "./SignUpSignIn"
import HomeSignupButton from "@/components/HomeSignupButton"

function Hero()
{
  return(
    <main>
      <div className="flex h-[240px] relative bg-gradient-to-r from-[#FF7BA2] to-white">
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
    return (
    <div className="">
      <Hero />
      <SignInSignUp />
      
    </div>
    )
}
