"use client";
import { Post } from "@/app/types/post";
import PostCard from "@/components/postCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimelinePostCard from "@/app/timeline/timelineCard";
async function getData(familyId: string | undefined) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/posts?familyId=${familyId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      // Handle error cases
      throw Error("You are not in this family");
    }
    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error to be caught by the calling code
  }
}

type FamilyTimelineProps = {
  id: string | undefined;
};

export default function FamilyTimeline({ id }: FamilyTimelineProps) {
  const [posts, setPosts] = useState<Post[]>();
  const router = useRouter();
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(id);
        // Process data or set it to state as needed
        setPosts(fetchedData);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
        router.push("/families");
      }
    }
    try {
      fetchData();
    } catch (error: any) {
      router.push("/families");
    }
  }, [id, router]);
  return (
    <div className="flex-col flex">
      <div className="h-2  mx-4 rounded-xl bg-links"></div>
      <div className={`flex-col mt-1 ${posts && posts.length < 3 && "pb-48"}`}>
        {!posts && (
          <div className="flex justify-center items-center">
            <p>Loading...</p>
          </div>
        )}
        {!Array.isArray(posts) && (
          <div className="flex-col flex justify-center space-y-2 items-center text-2xl w-full pb-60">
            <p>You are not a part of this family.</p>
          </div>
        )}
        {posts && posts.length == 0 && (
          <div className="flex-col flex justify-center space-y-2 items-center text-2xl w-full pb-60">
            <p>Be the first to post in this family!</p>
            <Link href={`/create-post?familyId=${id}`}>
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Create Post
              </button>
            </Link>
          </div>
        )}
        {posts &&
          Array.isArray(posts) &&
          posts.map((post, index) => (
            <div key={index} className="flex-col mt-2">
              <TimelinePostCard post={post} />
            </div>
          ))}

        {posts && posts.length >= 1 && (
          <div className="flex justify-center items-center mt-4 ">
            <Link href={`/create-post?familyId=${id}`}>
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Create Post
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
