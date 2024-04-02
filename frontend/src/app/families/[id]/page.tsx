'use client'
import Link from "next/link";
import { useState,useEffect } from "react";
import MemberList from "./MemberView";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import FamilyTimeline from "./FamilyTimeline";
import { User } from "@/app/types/user";
import { useRouter } from "next/navigation";


type FamilyProps = {
  id:string,
  family_name:string,
  family_description:string,
  members:User[],

}





async function getData(familyId:string) {
  try {
    const res = await fetch(`http://localhost:8000/api/user/families?familyId=${familyId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      // Handle error cases
      throw Error("You are not a member of this family")
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error:any) {
    return error; // Rethrow the error to be caught by the calling code
  }
}
export default  function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<FamilyProps>();
  const { userId } = useUserContext();
  const router =useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        // Process data or set it to state as needed
        setData(fetchedData[0]);
      } catch (error: any) {
        console.error('Error in fetchData:', error.message);
        router.push("/families")
      }
    };
    fetchData();
  }, [router,params.id]);

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
        <div className="pb-48 flex flex-col bg-[#fde9f1]">
            {/* <Link href={'/families'}className="p-4">{'< Back to My Families'}</Link>
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
          <div className="flex-col my-8">
            <div className="flex space-x-2 justify-center">
              <div className="flex-col">
                <Image
                  src="/images/family_heartbox.png"
                  width={200}
                  height={100}
                  alt={`Selected Heartbox Picture`}
                />
                <h2 className="flex w-3/5 shadow-xl text-center justify-center font-loves text-lg font-bold mx-auto bg-[#fdeff1] py-1 border-2 border-[#bb474d] rounded-xl">
                  {data?.family_name}  
                </h2>
              </div>
              <MemberList members={data?.members} signedInUserId={Number(userId)}/>
              
              
            </div>
            <div className="mt-2 "> <FamilyTimeline id={params.id}></FamilyTimeline> </div>
            
          </div>
          
        </div>
    )
  
  }


  