"use client";
import { usePostFeed } from "@/hooks/usePostFeed";
import LoadMore from "@/components/LoadMore";
import TimelinePostCard from "@/app/timeline/timelineCard";
import { motion } from "framer-motion";

export default function ProfileTimeline({ id }: { id: string }) {
  // Only relics from HeartBoxes the viewer shares with this person.
  const { posts, isLoading, isLoadingMore, hasMore, error, loadMore } =
    usePostFeed(`/api/user/posts?userId=${encodeURIComponent(id)}`);

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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-600 font-loves">Relics could not be loaded</p>
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
            <p>No shared relics yet.</p>
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
