"use client";
import { cldImage } from "@/utils/media";
import { apiFetch } from "@/utils/api";
import { use, useState, useEffect } from "react";
import MemberList from "./MemberView";
import Image from "next/image";
import Link from "next/link";
import FamilyTimeline from "./FamilyTimeline";
import { useRouter } from "next/navigation";
import { Family } from "@/app/types";

async function getData(familyId: string) {
  try {
    const res = await apiFetch(`/api/user/families?familyId=${familyId}`, {
      method: "GET",
    });

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
export default function Page(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [data, setData] = useState<Family>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        if (!Array.isArray(fetchedData) || fetchedData.length === 0) {
          router.push("/families");
          return;
        }
        setData(fetchedData[0]);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
        router.push("/families");
      }
    }
    fetchData();
  }, [router, params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-main">
      <div className="flex-col mb-8">
        <div className="flex-col justify-center">
          <div className="flex-col flex">
            <h2 className="text-3xl border-b-4 border-[#4D94D0] font-loves font-bold mx-auto mt-1">
              {data?.family_name}
            </h2>
            <Link
              href={`/families/${params.id}/settings`}
              className="mx-auto mt-1 text-sm text-links hover:underline"
            >
              HeartBox settings
            </Link>
            <Image
              unoptimized
              src={cldImage(data?.family_picture, 500)}
              width={250}
              height={100}
              alt={`Selected Heartbox Picture`}
              className="flex mx-auto mt-2"
            />
            {/* <h2 className="shadow-xl flex px-2 font-loves text-lg text-center font-bold mx-auto bg-[#fdeff1] py-1  border-2 border-[#bb474d] rounded-xl">
                  {data?.family_name} 
                </h2> */}
          </div>

          <MemberList
            id={data?.id}
            members={data?.members}
            invite_code={data?.invite_code}
          />
        </div>
        <div className="mt-2 ">
          {" "}
          <FamilyTimeline id={params.id}></FamilyTimeline>{" "}
        </div>
      </div>
    </div>
  );
}
