"use client";
import { useState, useEffect } from "react";
import MemberList from "./MemberView";
import Image from "next/image";
import FamilyTimeline from "./FamilyTimeline";
import { useRouter } from "next/navigation";
import { Family } from "@/app/types";

async function getData(familyId: string) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/families?familyId=${familyId}`,
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
export default function Page({ params }: { params: { id: string } }) {
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

  // const leaveFamily = async () =>
  // {
  //   try{
  //     const res = await fetch("http://localhost:8000/api/user/families/leave-family", {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           method: "PATCH",
  //           body: JSON.stringify(leaveFamilyData),
  //           credentials: "include",
  //         });
  //     const res_msg = await res.json()
  //     if (res.ok) {
  //       toast.success(res_msg);

  //       router.push("/families");
  //     } else toast.error(res_msg);

  //   }catch(error:any){
  //     console.log(error)
  //   }
  // }
  return (
    <div className="flex flex-col bg-main">
      {/* <Link href={'/families'} className="p-4">{'< Back to My Families'}</Link>
            <div className="flex space-x-4">
                <div className="flex w-96 h-10 ml-4 bg-[#333333]">
                    
                </div>
                <div className="flex flex-col">
                    <h3 className="text-4xl">Members:</h3>
                    <MemberList />
                    <button onClick={leaveFamily}>
                      Leave Family
                    </button>
                </div>
                
            </div> */}
      <div className="flex-col mb-8">
        <div className="flex-col justify-center">
          <div className="flex-col flex">
            <h2 className="text-3xl border-b-4 border-[#4D94D0] font-loves font-bold mx-auto mt-1">
              {data?.family_name}
            </h2>
            <Image
              src="/images/families.png"
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
