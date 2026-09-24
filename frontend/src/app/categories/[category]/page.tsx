"use client";
import { use } from "react";
import Link from "next/link";
import { usePostFeed } from "@/hooks/usePostFeed";
import LoadMore from "@/components/LoadMore";
import { toTitleCase } from "@/utils/utilFunctions";
import { motion } from "framer-motion";
import TimelineCard from "@/app/timeline/timelineCard";

export default function CategoryPage(props: {
  params: Promise<{ category: string }>;
}) {
  const params = use(props.params);
  const slug = decodeURIComponent(params.category)
    .replace(/-relics$/, "")
    .toLowerCase();
  const categoryName = slug.replace(/-/g, " ");
  const {
    posts,
    isLoading: loading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePostFeed(`/api/user/posts/category/${encodeURIComponent(slug)}/`);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        duration: 0.8,
        bounce: 0.2,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.h1
        className="text-3xl text-default font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {toTitleCase(categoryName)} Relics
      </motion.h1>
      <motion.div
        className="flex-col flex gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <Link href={`/posts/${post.id}`}>
                  <TimelineCard post={post} />
                </Link>
              </motion.div>
            ))}
            <LoadMore
              hasMore={hasMore}
              isLoading={isLoadingMore}
              onLoadMore={loadMore}
            />
          </>
        ) : (
          <motion.p
            className="text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            No relics in this category yet
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
