"use client";
import { useState, useEffect } from "react";
import ProfileTimeline from "./profileTimeline";
import { User } from "@/app/types";
import Image from "next/image";

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
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        // Process data or set it to state as needed
        setUser(fetchedData);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
      }
    }
    fetchData();
  }, [params.id]);
  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-center space-x-24">
        <div className="flex flex-col items-center">
          <h2 className="text-xl ">
            {user?.first_name} {user?.last_name}
          </h2>
          <Image
            src="/images/default_profpic.png"
            width={50}
            height={150}
            alt="Heartbox Home Page Logo"
            className="h-12 rounded-full"
            style={{ objectFit: "cover" }}
          />
          {/* <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="/placeholder-user.jpg" alt="Profile Picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar> */}
          {/* <Button className="bg-pink-700 text-white">EDIT PROFILE PICTURE</Button> */}
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-loves font-bold">FRIENDS</h2>
          <div className="w-full h-1 bg-links mt-1 " />
          <p className="text-xl">0 friends</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between mt-8">
        <div className="w-full border-t border-pink-700" />
        <h2 className="text-xl mx-4 text-center">PERSONAL RELICS</h2>
        <div className="w-full border-t border-pink-700" />
      </div>
      {/* <Button className="bg-pink-700 text-white mt-2">VIEW ALL</Button> */}
      <div className="flex-col">
        <ProfileTimeline id={params.id} />
      </div>
    </div>
  );
}
