"use client";

import { useEffect, useState } from "react";
import { Post } from "../types/post";
import TimelinePostCard from "./timelineCard";
import Link from "next/link";
import Image from "next/image";
async function getData() {
  try {
    const res = await fetch(`http://localhost:8000/api/user/posts`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      // Handle error cases
      console.log("Failed Fetch");
      return Error();
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error to be caught by the calling code
  }
}

export default function Timeline() {
  const [posts, setPosts] = useState<Post[]>();
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData();
        // Process data or set it to state as needed
        setPosts(fetchedData);
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <div className="flex-col text-default space-y-2 h-full">
        {posts &&
          Array.isArray(posts) &&
          posts.map((post, index) => (
            <div key={index} className="flex-col mt-2">
              <TimelinePostCard post={post} />
            </div>
          ))}
        {posts && posts?.length === 0 && (
          <div className="flex-col flex items-center justify-center mt-24">
            <Image
              src={"/images/family_heartbox.png"}
              alt={""}
              width={150}
              height={100}
            ></Image>
            <p className="text-3xl font-loves font-bold border-b-2 mt-4 border-border">
              Nothing to see here yet...
            </p>
            <p className="text-2xl font-loves font-bold mt-2 text-center">
              <Link
                className="text-links hover:underline"
                href={"/families/add-family"}
              >
                Join a Family
              </Link>{" "}
              to fill up your timeline!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
