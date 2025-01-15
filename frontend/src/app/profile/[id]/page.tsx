"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import ProfileTimeline from "./profileTimeline";
import { User } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function getData(userId: string) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/users?userId=${userId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      // Handle error cases
      throw Error("You are not a member of this family");
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    return error; // Rethrow the error to be caught by the calling code
  }
}
export default function Profile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>();
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, authStatus } = useUserContext();
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const fetchedData = await getData(params.id);
        setUser(fetchedData);
        setError(null);
      } catch (error: any) {
        setError(error.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOwnProfile(userId === params.id);
    fetchData();
  }, [params.id, userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-links text-white px-4 py-2 rounded-md hover:bg-[#407cad] transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="flex flex-col mt-4">
  //     <div className="flex justify-center space-x-24">
  //       <div className="flex flex-col items-center">
  //         <h2 className="text-xl ">
  //           {user?.first_name} {user?.last_name}
  //         </h2>
  //         <Image
  //           src="/images/default_profpic.png"
  //           width={50}
  //           height={150}
  //           alt="Heartbox Home Page Logo"
  //           className="h-12 rounded-full"
  //           style={{ objectFit: "cover" }}
  //         />
  //         <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-1 mt-2 rounded-md active:scale-90">
  //           Edit Profile Picture
  //         </button>
  //       </div>
  //       <div className="flex flex-col items-center">
  //         <div>
  //           <h2 className="text-xl text-center font-loves font-bold">
  //             FRIENDS
  //           </h2>
  //           <div className="w-full h-1 bg-links mt-1 " />
  //           <p className="text-xl font-semibold">0 friends</p>
  //         </div>
  //         {user?.families && (
  //           <div>
  //             <h2 className="text-xl text-center font-loves font-bold">
  //               FAMILIES
  //             </h2>
  //             <div className="w-full h-1 bg-links mt-1 " />
  //             <Link className="text-xl font-semibold" href={"/families"}>
  //               {user?.families.length} families
  //             </Link>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //     <div className="flex w-full items-center justify-between mt-8">
  //       <div className="w-full border-t border-pink-700" />
  //       <h2 className="text-xl mx-4 text-center">PERSONAL RELICS</h2>
  //       <div className="w-full border-t border-pink-700" />
  //     </div>
  //     <div className="flex-col">
  //       <ProfileTimeline id={params.id} />
  //     </div>
  //   </div>
  // );
  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-center space-x-24">
        <div className="flex flex-col items-center">
          <h2 className="text-xl">
            {user?.first_name} {user?.last_name}
          </h2>
          <Image
            src={"/images/default_profpic.png"}
            width={50}
            height={150}
            alt="Profile Picture"
            className="h-12 w-12 mx-auto rounded-full object-cover"
          />
          <div className="flex-col mx-auto justify-center">
            {isOwnProfile && (
              <div className="flex items-center justify-center">
                <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-1 mt-2 rounded-md active:scale-90">
                  Edit Profile Picture
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div>
            <h2 className="text-xl text-center font-loves font-bold">
              FRIENDS
            </h2>
            <div className="w-full h-1 bg-links mt-1" />
            <p className="text-xl font-semibold">0 friends</p>
          </div>

          {user?.families && (
            <div>
              <h2 className="text-xl text-center font-loves font-bold">
                FAMILIES
              </h2>
              <div className="w-full h-1 bg-links mt-1" />
              <Link
                className="text-xl font-semibold hover:text-links transition-colors duration-300"
                href={"/families"}
              >
                {user.families.length} families
              </Link>
            </div>
          )}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="flex justify-center mt-4 space-x-4">
          <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-4 py-2 rounded-md active:scale-90">
            Add Friend
          </button>
          <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-4 py-2 rounded-md active:scale-90">
            Send Message
          </button>
        </div>
      )}

      <div className="flex w-full items-center justify-between mt-8">
        <div className="w-full border-t border-pink-700" />
        <h2 className="text-xl mx-4 text-center">PERSONAL RELICS</h2>
        <div className="w-full border-t border-pink-700" />
      </div>

      <div className="flex-col">
        <ProfileTimeline id={params.id} />
      </div>
    </div>
  );
}
