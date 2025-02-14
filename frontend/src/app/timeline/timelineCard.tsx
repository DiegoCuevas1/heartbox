"use client";
import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import { IconContext } from "react-icons";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaShare,
  FaRegShareSquare,
} from "react-icons/fa";
import { getTimeSincePost } from "@/utils/utilFunctions";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TimelinePostCard({ post }: { post: Post }) {
  const postDate = new Date(post.datePosted);
  const timeSincePost = getTimeSincePost(postDate);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <motion.div
      className="flex-col flex border-b-[1px] border-gray"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/posts/${post.id}`}>
        <div className="flex items-center space-x-2 px-4">
          <div>
            <Image
              src={`https://res.cloudinary.com/dcyk5quni/${post.user_details.profile_picture}`}
              width={50}
              height={50}
              alt={`${post.user_details.first_name} ${post.user_details.last_name}'s profile picture`}
              className="rounded-full"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex-col ">
              <h2 className={`flex`}>
                <span>
                  {post.user_details.first_name} {post.user_details.last_name}
                </span>
                {post.categories && post.categories.length > 0 && (
                  <>
                    <span className="mx-2 text-links">•</span>
                    <span className="text-links">
                      <p className="hover:underline">
                        {post.categories.map((category) => category.name) +
                          " Relics"}
                      </p>
                    </span>
                  </>
                )}
                <span className="ml-2 text-date">{timeSincePost}</span>
              </h2>
              <p className="text-secondary">
                Posted in{" "}
                <span className="text-links font-bold">
                  {post.family_details.family_name}
                </span>{" "}
                family
              </p>
            </div>
          </div>
        </div>

        <div className="ml-16 flex-col">
          <p className="pl-2 my-1">{post.message}</p>
          {post.media_url && post.media_type && (
            <div className="pl-2 my-2">
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
      </Link>

      {/* Interaction Icons */}
      <div className="ml-16 pl-2 py-2 flex items-center space-x-6">
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
