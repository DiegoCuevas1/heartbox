"use client";
import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";
import { useState } from "react";

export default function PostCard({ post }: { post: Post }) {
  const postDate = new Date(post.datePosted);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const timePosted = postDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = `${
    postDate.getMonth() + 1
  }/${postDate.getDate()}/${postDate.getFullYear().toString().slice(-2)}`;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the like button
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
      // Revert the optimistic update if the request fails
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  return (
    <div className="flex-col flex mx-auto p-4 rounded-lg border-2 border-links">
      <div className="flex items-center space-x-2">
        <Link href={`/profile/${post.user}`}>
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${post.user_details.profile_picture}`}
            width={50}
            height={50}
            alt={`${post.user_details.first_name} ${post.user_details.last_name}'s profile picture`}
            className="h-12 rounded-full"
            style={{ objectFit: "cover" }}
          />
        </Link>
        <div className="flex-col">
          <h2 className={`flex items-center`}>
            <Link href={`/profile/${post.user}`}>
              {post.user_details.first_name} {post.user_details.last_name}
            </Link>
            {post.categories && post.categories.length > 0 && (
              <>
                <span className="mx-2 text-links">•</span>
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
          </h2>
          <p className="font-bold text-links">
            <Link href={`/families/${post.family_details.id}`}>
              {post.family_details.family_name}
            </Link>
          </p>
        </div>
      </div>
      <p className="mx-4 flex p-2">{post.message}</p>
      {post.media_url && post.media_type && (
        <div className="bg-white rounded-lg p-2 mx-auto">
          {post.media_type === "IMAGE" ? (
            <Image
              src={`https://res.cloudinary.com/dcyk5quni/${post.media_url}`}
              alt="Post image"
              width={400}
              height={400}
              className="rounded-lg object-contain max-h-[400px] w-auto"
            />
          ) : (
            post.media_type === "VIDEO" && (
              <video
                src={`https://res.cloudinary.com/dcyk5quni/video/upload/${post.media_url}`}
                controls
                className="rounded-lg max-h-[400px] w-auto"
              />
            )
          )}
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-1">
            <FaRegComment className="text-xl" />
            <span className="text-sm">{post.comments?.length || 0}</span>
          </div>
        </div>
        <span className="text-gray-900">
          {timePosted} {formattedDate}
        </span>
      </div>
    </div>
  );
}
