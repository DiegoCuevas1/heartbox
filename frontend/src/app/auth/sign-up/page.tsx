"use client";
import Link from "next/link";
import FormComponent from "./form";
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const { authStatus } = useUserContext();
  const router = useRouter();
  if (authStatus) {
    window.location.href = "/families";
  }
  return (
    <div className="flex-col h-screen bg-[#fde9f1]">
      <div className="flex flex-col pt-4">
        <div className="border-2 border-[#D31C60] justify-center mx-2 rounded-xl bg-[#eecfe0]">
          <FormComponent />
        </div>
        <div className="flex justify-center items-center flex-col pt-4">
          <p className="text-[#2a292a]">
            Already Have an Account?{" "}
            <Link href={"/auth/sign-in"} className="text-[#d31c60] font-bold">
              Sign In
            </Link>
          </p>
          <p className="text-[#2a292a]">Have a Question?</p>
          <p className="text-[#2a292a]">
            {" "}
            Go to our{" "}
            <Link href={"/home"} className="text-[#d31c60] font-bold">
              FAQ page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
