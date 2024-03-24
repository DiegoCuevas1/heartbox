'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
async function getData() {
    try {
      const res = await fetch(`http://localhost:8000/api/user/posts`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!res.ok) {
        // Handle error cases
        console.log('Failed Fetch');
        return Error()
      }
      
      const data = await res.json();
      // Process the data as needed
      return data; // Add this line to return the data from the function
    } catch (error:any) {
      console.error('Error:', error.message);
      throw error; // Rethrow the error to be caught by the calling code
    }
  }

  
type FamilyTimelineProps =
{
    id:string | undefined;
}

export default function FamilyTimeline({id}:FamilyTimelineProps){
    const [posts, setPosts] = useState([])
    
    useEffect(()=>{
        async function fetchData() {
            try {
              const fetchedData = await getData();
              // Process data or set it to state as needed
              setPosts(fetchedData);
            } catch (error: any) {
              console.error('Error in fetchData:', error.message);
            }
          };
          fetchData();
        }
    ,[])
    return(
        <div className="flex-col flex">
           <div className="grid grid-cols-3 gap-2">
                <div className="flex mt-8">
                    <Link href='/create-post'><button>Add Relic</button></Link>
                </div>
                <div className="flex h-10">
                    <h2 className="mx-auto text-3xl border-b-4 border-[#d31c60] font-loves font-bold">POSTS</h2>
                </div>
                <button className="flex justify-end mr-2 mt-8">Filters</button>
            </div>
            <div className="h-2 mt-1 w-full rounded-xl bg-[#d31c60]" ></div>
        </div>
    )
}

