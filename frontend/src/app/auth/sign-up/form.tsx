"use client";
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import Link from "next/link";
function FormComponent() {
    const validate = (email: any) =>
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    
    const router = useRouter();
    const [step,setStep] = useState(1)
    const handleNextStep = () => {
      setStep(step + 1);
    };
  
    const handlePrevStep = () => {
      setStep(step - 1);
    };
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (!validate(formData.get("email"))) {
            toast.error("Not an Email! Try Again.");
            return;
          }
        if (!(formData.get("password") === formData.get("confirm_password"))) {
            toast.error("Passwords are not the same. Try Again.");
            return;
          }

        formData.delete("confirm_password");
        try {
            const res = await fetch("http://localhost:8000/api/user/sign-up", {
              method: "POST",
              body: formData,
            });
      
            const res_msg = await res.text();
      
            if (res.ok) {
              toast.success(res_msg);
              router.push("/auth/sign-in");
            } else toast.error(res_msg);
          } catch (error) {
            toast.error((error as Error).toString());
          }
    }
  return (
    <div className="text-black px-12 py-6">
      
      <form className="flex flex-col items-center justify-center mx-auto max-w-md" onSubmit={handleSubmit}>
            {step === 1 && ( <>
              <h2 className="pb-6 flex font-loves font-bold text-3xl justify-center items-center text-center">
        <span className="border-b-2 border-[#D31c60]">Sign Up</span>
      </h2><div className="flex flex-col mb-4">
              
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
            <div className="flex flex-col mb-4">
              <label htmlFor="password" className=" font-loves font-bold mb-1">
                Confirm Password<span className="text-red-500">*</span>:
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="border-2 p-1 border-gray-400 rounded-md"
                required
                maxLength={50}
                placeholder="Password"
              />
            </div>
            <button onClick={handleNextStep} className="w-36 h-12 rounded-xl text-white drop-shadow-xl bg-[#d31c60] font-loves font-bold text-3xl hover:cursor-pointer hover:scale-125 active:scale-95 transition-all">
              Enter
            </button></>)}

            {step === 2 && ( <>
              <h2 className="pb-6 flex font-loves font-bold text-3xl justify-center items-center text-center">
        <span className="border-b-2 border-[#D31c60]">Personal Info</span>
      </h2>
            <div className="flex flex-col mb-4">
              <label htmlFor="firstName" className="font-loves font-bold mb-1">
                First Name<span className="text-red-500">*</span>:
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                className="border-2 p-1 border-gray-400 rounded-md"
                required
                maxLength={50}
                placeholder="First Name"
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="lastName" className=" font-loves font-bold mb-1">
                Last Name<span className="text-red-500">*</span>:
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                className="border-2 p-1 border-gray-400 rounded-md"
                required
                maxLength={50}
                placeholder="Last Name"
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="birthDate" className=" font-loves font-bold mb-1">
                Birth Date<span className="text-red-500">*</span>:
              </label>
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                className="border-2 p-1 border-gray-400 rounded-md"
                required
                maxLength={50}
                placeholder="mm/dd/yyyy"
              />
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="birthDate" className=" font-loves font-bold mb-1">
                PIN<span className="text-red-500">*</span>:
              </label>
              <input
                id="pin"
                type="password"
                name="pin"
                className="border-2 p-1 border-gray-400 rounded-md"
                required
                maxLength={50}
                placeholder="PIN"
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="mx-auto w-36 h-12 font-loves font-bold hover:scale-125 transition-all text-2xl active:scale-95 text-white rounded-xl bg-[#d31c60]"
                onClick={handlePrevStep}
              >
                Previous
              </button>
              <button
                className="mx-auto w-36 h-12 text-[#d31c60] font-loves font-bold hover:scale-125 transition-all active:scale-95 text-2xl rounded-xl bg-[#ffffff]"
                type="submit"
              >
                Submit
              </button>
            </div>
           </>)}
          </form>
    </div>
  );
}

export default FormComponent;
