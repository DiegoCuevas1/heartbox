import Image from "next/image";
import Link from "next/link";

export default function SignInSignUp() {
  return (
    <div id='more' className="flex flex-col pb-4 bg-[#fde9f1]">
      <div className="flex flex-col justify-center w-screen h-40 ">
        <Image 
          src="/images/heartbox_logo.png"
          alt="HeartBox Logo without Text"
          width={100}
          height={100}
          className="self-center"
        />
        <h2 className="mt-3 text-[#565356] text-3xl font-loves text-center font-bold">LEAVE YOUR MARK TODAY</h2>
      </div>
      <div className="relative">
        <Image
          className="w-full h-full object-cover"
          src="/images/family_photos.png"
          alt="Background"
          height={100}
          width={100}
        />
        
        {/* Your content (buttons or other elements) */}
        <div className="absolute flex-col space-y-4 inset-0 flex items-center justify-center">
          <button className="bg-[#D31C5F] text-3xl text-white px-4 py-2 rounded-lg hover:scale-110 transition-all shadow-[0_20px_10px_-15px_rgba(0,0,0,.8)]"><Link href={'/auth/sign-up'}>SIGN UP</Link></button>
          <p className="bg-white p-2 rounded-full text-2xl font-bold border-4 border-[#d31c60]">OR</p>
          <button className="bg-[#D31C5F] text-3xl text-white px-4 py-2 rounded-lg hover:scale-110 transition-all shadow-[0_20px_10px_-15px_rgba(0,0,0,.8)]"><Link href={'/auth/sign-in'}>SIGN IN</Link></button>
        </div>
      </div>


    </div>
  );
}
