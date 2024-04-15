'use client';
import { Post } from "@/app/types/post";
import { useEffect, useState } from "react";
import PostCard from "@/components/postCard";
async function getData(postId:string) {
    try {
      const res = await fetch(`http://localhost:8000/api/user/posts?postId=${postId}`, {
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

export default function PostPage({ params }: { params: { id: string } })
{
    const [post,setPost] = useState<Post | null>()
    const postId = params.id;
    useEffect(()=>
    {
        async function fetchData() {
            try {
              const fetchedData = await getData(postId);
              // Process data or set it to state as needed
              setPost(fetchedData);
            } catch (error: any) {
              console.error('Error in fetchData:', error.message);
            }
          };
          fetchData();
    },[postId])
    return (
    <>
        <div className="flex-col mt-4">
             {post && <PostCard post={post} />}
        </div>
    </>
    )
}
