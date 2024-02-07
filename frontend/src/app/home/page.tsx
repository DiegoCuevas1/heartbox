import Link from "next/link"
import Logout from "@/components/logoutbtn"
import Button from "@/components/button"
import SignInSignUp from "./SignUpSignIn"

function Hero()
{
  return(
    <main>
      <div className="h-[40rem] items-center justify-center flex flex-col">
          {/* Content of your home page */}
          
          <div className="mb-8 mx-4">
            <h2 className=" font-loves text-white text-5xl text-center ">Welcome to HeartBox</h2>       
            <p className=" text-white text-2xl text-center ">an app to pass on your legacy</p>
          </div>
          <div className="my-2">
           
            <p className="text-white text-5xl text-center font-bold">MANY LAST WORDS</p>
          </div>
          <div className="my-2">
           <p className=" text-white text-xl text-center font-bold">Save Your Memories</p>
          </div>
          
          <div className="mt-12">
            <p className=" text-white text-xl text-center font-bold"><Link href={'/home/#more'}>Learn More</Link></p>
            <p className=" text-white text-lg text-center font-bold"><Link href={'/home/#more'}>↓</Link></p>
          </div>
        </div>
        {/* Image overlay */}
        <div className="absolute inset-0 h-[45rem] bg-cover bg-center z-[-1]"
             style={{ backgroundImage: 'url("/images/home_family.jpg")' }}>
          {/* Optional: You can adjust the opacity of the overlay if needed */}
          <div className="absolute inset-0 bg-[rgba(255,45,70,.35)]"></div>
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
