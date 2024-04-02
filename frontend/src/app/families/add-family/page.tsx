'use client';
import Link from "next/link";
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import FormComponent from "./form";


export default function Page() {
    
    return (
        <div className="flex-col h-screen bg-[#fde9f1]">
            
            <h2 className="pt-12 flex text-[#0c0c0c] font-loves font-bold text-3xl justify-center items-center text-center">
                <span className="border-b-2 border-[#D31c60]">Create or Join a Family</span>
            </h2>

            <FormComponent />

            <div className="flex justify-center items-center flex-col mt-7">
                <p className="text-[#2a292a]">Have a Question?</p>
                <p className="text-[#2a292a]"> Go to our <Link href={"/home"} className="text-[#d31c60] font-bold">FAQ page</Link></p>
            </div>
        </div>
    )
  }