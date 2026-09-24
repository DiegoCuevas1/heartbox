"use client";
import { apiFetch } from "@/utils/api";
import { Post } from "@/app/types/post";
import { use, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/AuthContext";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import PostCard from "@/components/postCard";
import CommentSection from "@/components/CommentSection";

async function getData(postId: string) {
  try {
    const res = await apiFetch(`/api/user/posts?postId=${postId}`, {
      method: "GET",
    });

    if (!res.ok) {
      // Handle error cases
      throw Error("You are not a member of this family");
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    return error; // Rethrow the error to be caught by the calling code
  }
}

export default function PostPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [post, setPost] = useState<Post | null>();
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUserContext();
  const router = useRouter();
  const postId = params.id;

  useEffect(() => {
    async function fetchData() {
      const fetchedData = await getData(postId);
      if (fetchedData instanceof Error) setNotFound(true);
      else setPost(fetchedData);
    }
    fetchData();
  }, [postId]);

  const isAuthor = !!post && !!user && post.user_details.id === user.id;

  const deleteRelic = async () => {
    if (!post || !confirm("Delete this relic? This can't be undone.")) return;
    const res = await apiFetch(`/api/user/posts/${post.id}`, {
      method: "DELETE",
    });
    const msg = sanitize_res_msg(await res.text());
    if (res.ok) {
      toast.success(msg);
      router.push(`/families/${post.family_details.id}`);
    } else toast.error(msg);
  };

  const saveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!post) return;
    const form = new FormData(e.currentTarget);
    const res = await apiFetch(`/api/user/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
      }),
    });
    if (res.ok) {
      setPost(await res.json());
      setIsEditing(false);
      toast.success("Relic updated");
    } else toast.error(sanitize_res_msg(await res.text()));
  };

  if (notFound) {
    return (
      <p className="text-center mt-10 text-lg">
        This relic doesn&apos;t exist, or it&apos;s in a HeartBox you&apos;re
        not part of.
      </p>
    );
  }

  return (
    <div className="flex-col mt-2">
      {post && (
        <>
          {isEditing ? (
            <form onSubmit={saveEdit} className="flex flex-col gap-2 p-4">
              <input
                name="title"
                defaultValue={post.title}
                maxLength={200}
                required
                className="border-2 border-[#d31c60] rounded-md px-2 py-1 font-bold"
              />
              <textarea
                name="description"
                defaultValue={post.message}
                rows={5}
                className="border-2 border-[#d31c60] rounded-md px-2 py-1"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#d31c60] text-white font-bold rounded-lg px-3 py-1"
                >
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <PostCard post={post} />
          )}
          {isAuthor && !isEditing && (
            <div className="flex justify-end gap-4 px-4 text-sm">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-links hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={deleteRelic}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
          <CommentSection postId={post.id} />
        </>
      )}
    </div>
  );
}
