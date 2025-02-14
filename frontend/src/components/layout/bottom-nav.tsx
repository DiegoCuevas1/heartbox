"use client";
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

const BottomNavBar = () => {
  const { isAuthenticated, user } = useUserContext();
  if (!isAuthenticated) {
    return <></>;
  }

  return (
    <div className="flex w-screen h-24 bg-[#b8d4ec] fixed bottom-0 z-[1] justify-around items-center lg:hidden">
      <Link href={"/timeline"}>
        <Image
          src="/images/icon-blue.png"
          width={50}
          height={50}
          alt="Heartbox Home Page Logo"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      <Link href={"/families"}>
        <Image
          src="/images/families-nav.png"
          width={55}
          height={55}
          alt="Heartbox Home Page Logo"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      <Link href={"/create-post"}>
        <Image
          src="/images/add-relic.png"
          width={50}
          height={50}
          alt="Heartbox Home Page Logo"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      <Link href={"/notifications"}>
        <Image
          src="/images/notification.png"
          width={50}
          height={50}
          alt="Heartbox Home Page Logo"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      {isAuthenticated && (
        <Link href={`/profile/${user?.id}`}>
          {user?.profile_picture && (
            <Image
              src={`https://res.cloudinary.com/dcyk5quni/${user?.profile_picture}`}
              width={50}
              height={50}
              alt="Heartbox Home Page Logo"
              style={{ width: "auto", height: "auto" }}
            />
          )}
        </Link>
      )}
    </div>
  );
};

export default BottomNavBar;
