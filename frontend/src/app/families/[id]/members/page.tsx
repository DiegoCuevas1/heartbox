"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/types/user";
import { Family } from "@/app/types";

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
  const [data, setData] = useState<Family>();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        // Process data or set it to state as needed
        setData(fetchedData[0]);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
        router.push("/families");
      }
    }
    fetchData();
  }, [router, params.id]);

  return <div className="flex"></div>;
}
