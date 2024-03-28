
'use client'
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
const BottomNavBar = () => {
  const { authStatus } = useUserContext();

  if(!authStatus)
  {
    return (<></>)
  }
  
  return(
    <div className="flex w-screen h-24 bg-[#F8B7B7]  fixed bottom-0 z-[1] justify-around items-center ">
        <Link href={"/timeline"}><Image src="/images/heartbox_logo.png" width={60} height={60} alt="Heartbox Home Page Logo" /></Link>
        <Link href={"/families"}><Image src="/images/families.png" width={55} height={55} alt="Heartbox Home Page Logo" /></Link>
        <Link href={"/create-post"}><Image src="/images/add-relic.png" width={50} height={50} alt="Heartbox Home Page Logo" /></Link>
        <Link href={"/home"}><Image src="/images/notification.png" width={50} height={50} alt="Heartbox Home Page Logo" /></Link>
        <Link href={"/profile"}><Image src="/images/default_profpic.png" width={50} height={50} alt="Heartbox Home Page Logo" /></Link>
    </div>
  )
};

export default BottomNavBar;