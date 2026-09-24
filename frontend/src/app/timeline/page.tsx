"use client";
import { useUserContext } from "@/context/AuthContext";
import { usePostFeed } from "@/hooks/usePostFeed";
import LoadMore from "@/components/LoadMore";
import TimelinePostCard from "./timelineCard";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";
export default function Timeline() {
  // Every relic from every HeartBox the user belongs to, newest first.
  const { posts, isLoading, isLoadingMore, hasMore, loadMore } =
    usePostFeed("/api/user/posts");
  const { isAuthenticated, isLoading: authLoading } = useUserContext();

  if (!authLoading && !isAuthenticated) {
    redirect("/home");
  }
  if (isLoading) {
    return (
      <div className="flex-col space-y-2">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="flex-col border-b-[1px] border-gray py-3">
            <div className="flex items-center space-x-2 px-4">
              {/* Profile picture skeleton */}
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />

              <div className="flex-col flex-1">
                {/* Name and time skeleton */}
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                </div>

                {/* Family name skeleton */}
                <div className="flex items-center space-x-1 mt-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>

            {/* Post content skeleton */}
            <div className="ml-16 pl-2 mt-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        className="flex-col flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Image src={"/images/families.png"} alt={""} width={150} height={100} />
        <p className="text-3xl font-loves font-bold border-b-2 mt-4 border-border">
          Nothing to see here yet...
        </p>
        <p className="text-2xl font-loves font-bold mt-2 text-center">
          <Link
            className="text-links hover:underline"
            href={"/families/add-family"}
          >
            Join or create a HeartBox
          </Link>{" "}
          to fill up your timeline!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-col justify-center items-center flex"
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
            <p>Be the first to add a relic!</p>
            <Link href="/create-post">
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Add a Relic
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                className="flex-col justify-center mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: Math.min(index % 20, 5) * 0.15,
                }}
              >
                <TimelinePostCard post={post} />
              </motion.div>
            ))}
            <LoadMore
              hasMore={hasMore}
              isLoading={isLoadingMore}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
