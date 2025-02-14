"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types/user";

import Link from "next/link";
import Image from "next/image";
async function getData(familyId: string) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/families/members?familyId=${familyId}`,
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
export default function Members({ params }: { params: { id: string } }) {
  const [data, setData] = useState<User[]>();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        // Process data or set it to state as needed
        setData(fetchedData);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
        router.push("/families");
      }
    }
    fetchData();
  }, [router, params.id]);

  return (
    <div className="flex">
      {data && data.length > 0 ? (
        data.map((user) => (
          <div key={user.id} className="flex items-center space-x-4">
            <Image
              src={"/images/default_profpic.png"}
              alt={`${user.first_name} ${user.last_name}'s Profile`}
              className="w-12 h-12 rounded-full object-cover"
              width={48}
              height={48}
            />
            <div>
              <Link href={`/profile/${user.id}`}>
                <h2 className="font-bold">
                  {user.first_name} {user.last_name}
                </h2>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p>No members found.</p>
      )}
    </div>
  );
}
