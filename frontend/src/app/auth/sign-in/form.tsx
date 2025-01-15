"use client";
import { FormEvent } from "react";
import toast from "react-hot-toast";
import { navSignIn } from "@/utils/NavAuthToggle";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";

function FormComponent() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("http://localhost:8000/api/user/sign-in", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      });
      const res_msg = await res.text();
      if (res.ok) {
        setTimeout(() => {
          window.location.href = "/families";
        }, 400);
      } else toast.error(sanitize_res_msg(res_msg));
    } catch (error) {
      toast.error(sanitize_res_msg((error as Error).toString()));
    }
  };

  return (
    <div className="text-black px-10 py-6">
      <h2 className="pb-6 flex font-loves font-bold text-3xl justify-center items-center text-center">
        <span className="border-b-2 border-[#D31c60]">Sign In</span>
      </h2>
      <form
        className="flex flex-col items-center justify-center mx-auto max-w-md"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col mb-4">
          <label htmlFor="email" className="font-loves font-bold mb-1">
            Email<span className="text-red-500">*</span>:
          </label>
          <input
            id="email"
            type="text"
            name="email"
            className="border-2 p-1 border-gray-400 rounded-md"
            required
            maxLength={50}
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label htmlFor="password" className=" font-loves font-bold mb-1">
            Password<span className="text-red-500">*</span>:
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="border-2 p-1 border-gray-400 rounded-md"
            required
            maxLength={50}
            placeholder="Password"
          />
        </div>
        <div className="flex space-x-8 px-2 pb-7 ">
          <div className="space-x-1">
            <input
              type="checkbox"
              id="remember"
              className="accent-[#d31c60] bg-white border-2 border-[#d31c60]"
            />
            <label htmlFor="remember" className="font-loves font-bold">
              Remember Me
            </label>
          </div>
          <button className="py-1 px-2 italic font-loves font-bold rounded-xl text-sm bg-[#d31c60] text-white ">
            Forgot Password?
          </button>
        </div>
        <button
          type="submit"
          className="w-36 h-12 rounded-xl text-white drop-shadow-xl bg-[#d31c60] font-loves font-bold text-3xl hover:cursor-pointer hover:scale-125 active:scale-95 transition-all"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default FormComponent;
