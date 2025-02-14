"use client";

import { Comment } from "@/app/types/comment";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getTimeSincePost } from "@/utils/utilFunctions";

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/comments?postId=${postId}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/api/user/comments", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          message: replyText,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      const newReply = await response.json();

      // Update the comments state to include the new reply
      setComments((prevComments) => {
        const updateReplies = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplies(comment.replies),
              };
            }
            return comment;
          });
        };
        return updateReplies(prevComments);
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/api/user/comments", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          message: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newCommentData = await response.json();
      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const renderComment = (
    comment: Comment,
    level: number = 0,
    index: number = 0,
    comments: Comment[]
  ) => {
    const isReplyOpen = replyingTo === comment.id;
    const shouldIndent = level === 1;
    const shouldShowMention = level > 1;

    // Check if this comment is from a different user than the previous one
    const previousComment = index > 0 ? comments[index - 1] : null;
    const isNewUser =
      previousComment &&
      comment.user_details.id !== previousComment.user_details.id;
    const isReplyingToPrevious =
      previousComment &&
      comment.parent_user?.id === previousComment.user_details.id;

    // Add extra margin if it's a new user and not replying to the previous comment
    const userChangeSpacing =
      isNewUser && !isReplyingToPrevious ? "mt-6" : "mt-2";

    return (
      <div
        key={comment.id}
        className={`relative ${shouldIndent ? "ml-8" : ""} ${userChangeSpacing}`}
      >
        {shouldIndent && (
          <div className="absolute left-[-24px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-300 to-blue-500" />
        )}
        <div>
          <div className="bg-white rounded-lg p-4 ">
            <div className="flex items-center mb-2">
              <Image
                src={`https://res.cloudinary.com/dcyk5quni/${comment.user_details.profile_picture}`}
                alt={`${comment.user_details.first_name}'s profile`}
                className="w-8 h-8 rounded-full mr-2"
                width={32}
                height={32}
              />
              <div>
                <Link href={`/profile/${comment.user_details.id}`}>
                  <span className="font-semibold text-gray-">
                    {comment.user_details.first_name}{" "}
                    {comment.user_details.last_name}
                  </span>
                </Link>
                <span className="text-gray-500 text-sm ml-2">
                  {getTimeSincePost(new Date(comment.datePosted))}
                </span>
              </div>
            </div>
            <p className="text-default">
              {shouldShowMention && comment.parent_user && (
                <Link href={`/profile/${comment.parent_user.id}`}>
                  <span className="text-blue-500 font-medium">
                    @{comment.parent_user.first_name}{" "}
                    {comment.parent_user.last_name}{" "}
                  </span>
                </Link>
              )}
              {comment.message}
            </p>
            <button
              onClick={() => {
                setReplyingTo(isReplyOpen ? null : comment.id);
                if (isReplyOpen) {
                  setReplyText("");
                }
              }}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              Reply
            </button>
            {isReplyOpen && (
              <div className="mt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2 border rounded-lg resize-none"
                  placeholder="Write a reply..."
                  rows={2}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              {comment.replies.map((reply, replyIndex) =>
                renderComment(
                  reply,
                  level + 1,
                  replyIndex,
                  comment.replies || []
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`bg-white rounded-lg flex p-4 transition-all duration-300 ease-in-out`}
      >
        <div className="flex-grow">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`w-full p-2 border rounded-lg resize-none transition-all duration-300 ease-in-out
              ${isFocused ? "border-blue-500 min-h-[120px]" : "min-h-[40px]"}
            `}
            placeholder="Write a comment..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (!newComment.trim()) {
                setIsFocused(false);
              }
            }}
          />
        </div>
        <div className="flex items-start ml-2">
          <button
            onClick={handleSubmitComment}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Comment
          </button>
        </div>
      </div>
      {comments.map((comment, index) =>
        renderComment(comment, 0, index, comments)
      )}
    </div>
  );
};

export default CommentSection;
