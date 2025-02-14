"use client";
import { Post } from "@/app/types/post";
import PostCard from "@/components/postCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryName = params.category.replace("-relics", "").toLowerCase();

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
        type: "spring",
        duration: 0.8,
        bounce: 0.2,
      },
    },
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/posts/category/${categoryName.toLowerCase()}/`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryName]);

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
        {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Relics
      </motion.h1>
      <motion.div
        className="flex-col flex gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <Link href={`/posts/${post.id}`}>
                <PostCard post={post} />
              </Link>
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-center text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            No posts found in this category
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
