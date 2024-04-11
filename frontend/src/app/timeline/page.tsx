'use client';

import { useEffect, useState } from "react";
import { Post } from "../types/post";
import PostCard from "@/components/postCard"
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

export default function Timeline() {
    const [posts, setPosts] = useState<Post[]>()
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
    return (
      <>
        <div className="flex-col text-default space-y-2 pt-4 h-full">
            {posts && Array.isArray(posts) && posts.map((post,index) => (
              <div key={index} className="flex-col">
                    <PostCard post={post} />
              </div>
            ))}
        </div>
        {posts && posts?.length===0 && 
              <div className="flex-col ">
                
              </div>
        }
     </>
    )
  }
  