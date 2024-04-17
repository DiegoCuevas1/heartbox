'use client';
import Link from "next/link";
import FormComponent from "./form";
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
export default function Login() {
  const { authStatus } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

    // Delay the authentication status check until after the component mounts
    useEffect(() => {
      setIsLoading(false); // Mark loading as complete
    }, []);
  
    // Redirect if user is already authenticated
    useEffect(() => {
      if (!isLoading && authStatus) {
        window.location.href = '/families';
      }
    }, [isLoading, authStatus, router]);

  return (
    <div className="flex-col h-[45rem] bg-[#fde9f1]">
      <div className="flex flex-col pt-4">    
        <div className="border-2 border-[#D31C60] mx-auto rounded-xl bg-[#eecfe0]"><FormComponent /></div>
        <div className="flex justify-center items-center flex-col pt-4">
          <p className="text-[#2a292a]">Need an Account? <Link href={"/auth/sign-up"} className="text-[#d31c60] font-bold">Sign Up</Link></p>
          <p className="text-[#2a292a]">Have a Question?</p>
          <p className="text-[#2a292a]"> Go to our <Link href={"/home"} className="text-[#d31c60] font-bold">FAQ page</Link></p>
        </div>
      </div>
    </div>

  );
}