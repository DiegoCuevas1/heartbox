import Link from "next/link";
export default function HomeSignupButton() {
  return (
    <div className="relative">
      <Link href={"/auth/sign-up"}>
        <button className="relative z-10 w-28 h-[53px] rounded-lg text-white font-normal my-2 mx-1 text-shadow text-xl box-shadow-xl  font-['Seguoe UI'] bg-[#D31C5F]">
          SIGN UP
        </button>
      </Link>
    </div>
  );
}
