'use client';
import Link from "next/link";
import FormComponent from "./form";
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const { authStatus } = useUserContext();
  const router = useRouter();
  if (authStatus) {
    router.push('/families');
    return (
      <div>
        <p>You are already logged in. Redirecting...</p>
      </div>
    );
  }
  return (
    // <div className="border-2 justify-center rounded-[25px] px-6 py-8 border-primary relative bg-neutral shadow-lg mx-auto sm:w-11/12 md:w-10/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12 my-4">
    //   <div className="py-3">
    //     <FormComponent />
    //   </div>
    //   <p className="flex text-center flex-col m:flex-row justify-center">
    //     Already have an account?
    //     <span className="font-bold">
    //       <Link href={"/auth/sign-in"}>Login</Link>
    //     </span>
    //   </p>
    // </div>
    <div className="flex-col h-[43rem] bg-[#fde9f1]">
      {/* <div className="border-2 border-[#D31C60] mx- rounded-xl bg-[#eecfe0]"><FormComponent /></div>
      <div className="flex justify-center mx-auto items-center flex-col pt-4">
        <p className="text-[#2a292a]">Already have an Account? <Link href={"/auth/sign-in"} className="text-[#d31c60] font-bold">Sign in</Link></p>
        <p className="text-[#2a292a]">Have a Question?</p>
        <p className="text-[#2a292a]"> Go to our <Link href={"/home"} className="text-[#d31c60] font-bold">FAQ page</Link></p>
      </div> */}
      <div className="flex flex-col pt-4">    
        <div className="border-2 border-[#D31C60] mx-auto rounded-xl bg-[#eecfe0]"><FormComponent /></div>
        <div className="flex justify-center items-center flex-col pt-4">
          <p className="text-[#2a292a]">Already Have an Account? <Link href={"/auth/sign-in"} className="text-[#d31c60] font-bold">Sign In</Link></p>
          <p className="text-[#2a292a]">Have a Question?</p>
          <p className="text-[#2a292a]"> Go to our <Link href={"/home"} className="text-[#d31c60] font-bold">FAQ page</Link></p>
        </div>
      </div>
    </div>

  );
}
