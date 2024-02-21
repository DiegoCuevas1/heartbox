
import Link from "next/link";
import FormComponent from "./form";

export default function Login() {
  return (
    <div className="flex-col h-screen bg-[#fde9f1]">
      <div className="flex flex-col pt-4">    
        <div className="border-2 border-[#D31C60] mx-auto rounded-xl bg-[#eecfe0]"><FormComponent /></div>
      </div>
    </div>

  );
}