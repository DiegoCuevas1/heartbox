"use client";
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

const BottomNavBar = () => {
  const { profilePic, authStatus, userId } = useUserContext();
  if (!authStatus) {
    return <></>;
  }

  return (
    <div className="flex w-screen h-24 bg-[#b8d4ec] fixed bottom-0 z-[1] justify-around items-center">
      <Link href={"/timeline"}>
        <Image
          src="/images/heartbox_logo.png"
          width={60}
          height={60}
          alt="Heartbox Home Page Logo"
        />
      </Link>
      <Link href={"/families"}>
        <Image
          src="/images/families-nav.png"
          width={55}
          height={55}
          alt="Heartbox Home Page Logo"
        />
      </Link>
      <Link href={"/create-post"}>
        <Image
          src="/images/add-relic.png"
          width={50}
          height={50}
          alt="Heartbox Home Page Logo"
        />
      </Link>
      <Link href={"/notifications"}>
        <Image
          src="/images/notification.png"
          width={50}
          height={50}
          alt="Heartbox Home Page Logo"
        />
      </Link>
      {authStatus && (
        <Link href={`/profile/${userId}`}>
          {profilePic && (
            <Image
              src="/images/default_profpic.png"
              width={50}
              height={100}
              alt="Heartbox Home Page Logo"
              className="h-12 rounded-full"
              style={{ objectFit: "cover" }}
            />
          )}
        </Link>
      )}
    </div>
  );
};

export default BottomNavBar;
