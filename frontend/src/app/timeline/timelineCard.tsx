"use client";
import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegShareSquare,
} from "react-icons/fa";
import { getTimeSincePost } from "@/utils/utilFunctions";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TimelinePostCard({ post }: { post: Post }) {
  const postDate = new Date(post.datePosted);
  const timeSincePost = getTimeSincePost(postDate);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const handleLike = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/posts/${post.id}/like`,
        {
          method: isLiked ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error("Error updating like:", error);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <Link href={`/profile/${post.user_details.id}`}>
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${post.user_details.profile_picture}`}
            alt={`${post.user_details.first_name}'s profile picture`}
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>
        <div className="ml-4 flex-grow">
          <div className="flex items-center">
            <Link href={`/profile/${post.user_details.id}`}>
              <span className="font-semibold hover:text-blue-500">
                {post.user_details.first_name} {post.user_details.last_name}
              </span>
            </Link>

            {post.categories && post.categories.length > 0 && (
              <>
                <span className="mx-2 text-gray-500">•</span>
                <Link
                  href={`/categories/${post.categories[0].name.toLowerCase()}-relics`}
                  className="text-links"
                >
                  <p className="hover:underline">
                    {post.categories.map((category) => category.name) +
                      " Relics"}
                  </p>
                </Link>
              </>
            )}
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-500">{timeSincePost}</span>
          </div>
          <h2 className="font-semibold mt-1">{post.title}</h2>
          <div className="mt-2">
            <p className="my-1">{post.message}</p>
            {post.media_url && post.media_type && (
              <div className="my-2">
                {post.media_type === "IMAGE" ? (
                  <Image
                    src={`https://res.cloudinary.com/dcyk5quni/${post.media_url}`}
                    alt="Post image"
                    width={400}
                    height={400}
                    className="rounded-lg object-contain max-h-[300px] w-auto"
                  />
                ) : (
                  post.media_type === "VIDEO" && (
                    <video
                      src={`https://res.cloudinary.com/dcyk5quni/video/upload/${post.media_url}`}
                      controls
                      className="rounded-lg max-h-[300px] w-auto"
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interaction Icons */}
      <div className="mt-4 flex items-center space-x-6">
        <button
          onClick={handleLike}
          className="flex items-center space-x-1 group"
        >
          {isLiked ? (
            <FaHeart className="text-xl text-red-500 group-hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="text-xl group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm">{likeCount}</span>
        </button>
        <Link
          href={`/posts/${post.id}`}
          className="flex items-center space-x-1 group"
        >
          <FaRegComment className="text-xl group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.comments?.length || 0}</span>
        </Link>

        <button className="group">
          <FaRegShareSquare className="text-xl group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
