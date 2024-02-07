'use client';
import Link from "next/link";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import MemberList from "./MemberView";
import toast from "react-hot-toast";


async function getData(id:string) {
    try {
      const res = await fetch(`http://localhost:8000/api/user/families?familyId=${id}`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!res.ok) {
        // Handle error cases
        console.log('Failed Fetch');
        return Error('Failed To Fetch')
      }
  
      const data = await res.json();
      // Process the data as needed
      
      return data; // Add this line to return the data from the function
    } catch (error:any) {
      console.error('Error:', error.message);
      throw error; // Rethrow the error to be caught by the calling code
    }
  }

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [leaveFamilyData,setLeaveFamilyData] = useState({familyId:`${params.id}`})
    const fetchData = async () => {
        try {
          const data = await getData(params.id);
          // Process data or set it to state as needed
          setData(data)
        } catch (error:any) {
          console.error('Error in fetchData:', error.message);
        }
      };
    
      // Call fetchData when the component mounts
      useEffect(() => {
        fetchData();
      }, []);

      const leaveFamily = async () =>
      {
        try{
          const res = await fetch("http://localhost:8000/api/user/families/leave-family", {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "PATCH",
                body: JSON.stringify(leaveFamilyData),
                credentials: "include",
              });
          const res_msg = await res.json()
          if (res.ok) {
            toast.success(res_msg);
            
            router.push("/families");
          } else toast.error(res_msg);
          
        }catch(error:any){
          console.log(error)
        }
      }
    return (
        <div className="mt-8 flex flex-col h-screen">
            <Link href={'/families'}className="p-4">{'< Back to My Families'}</Link>
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
                
            </div>
        </div>
    )
  }