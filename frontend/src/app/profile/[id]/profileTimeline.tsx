"use client";
import { Post } from "@/app/types/post";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TimelinePostCard from "@/app/timeline/timelineCard";
import { motion } from "framer-motion";

async function getData(id: string | undefined) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/posts?userId=${id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw Error("You are not in this family");
    }
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export default function ProfileTimeline({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const fetchedData = await getData(id);
        setPosts(fetchedData);
      } catch (error) {
        console.error("Error in fetchData:", error);
        router.push("/families");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex-col space-y-4 w-full max-w-2xl mx-auto py-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
            <div className="mt-4 h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || !Array.isArray(posts)) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-600 font-loves">No posts available</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-col flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className={`flex-col mt-1 ${posts.length < 3 && "pb-48"}`}>
        {posts.length === 0 ? (
          <motion.div
            className="flex-col flex justify-center space-y-2 items-center text-2xl w-full "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p>Be the first to post in this family!</p>
            <Link href="/create-post">
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Create Post
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {posts.map((post, index) => (
              <motion.div
                key={index}
                className="flex-col justify-center mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                }}
              >
                <TimelinePostCard post={post} />
              </motion.div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
