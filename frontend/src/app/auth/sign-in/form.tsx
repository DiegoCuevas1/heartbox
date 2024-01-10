"use client";
import { FormEvent } from "react";
import { useRouter } from 'next/navigation'
import toast from "react-hot-toast";

function FormComponent() {
    const validate = (email: any) =>
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

    const router = useRouter();
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) =>
    {
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
                toast.success(res_msg);
                router.push("/home");
              } else toast.error(res_msg);
            } catch (error) {
              toast.error((error as Error).toString());
        }
    }

    return (
        <div className="text-black">
          <form className="flex flex-col items-center justify-center mx-auto max-w-md" onSubmit={handleSubmit}>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="mb-1">
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
              <label htmlFor="password" className="mb-1">
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
            <button className="w-48 h-12 rounded-xl text-white drop-shadow-xl bg-default hover:cursor-pointer hover:bg-[#d94e60] active:scale-95 transition-all">
              Submit
            </button>
          </form>
        </div>
      );
}

export default FormComponent;