"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/utils/api";
import { Post } from "@/app/types/post";

export const PAGE_SIZE = 20;

/**
 * Loads relics a page at a time from /api/user/posts (or the category feed).
 * `path` is the endpoint including any filters, e.g. "/api/user/posts?familyId=3".
 * Pass null to skip loading.
 */
export function usePostFeed(path: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (before?: number) => {
      if (!path) return [];
      const sep = path.includes("?") ? "&" : "?";
      const cursor = before ? `&before=${before}` : "";
      const res = await apiFetch(`${path}${sep}limit=${PAGE_SIZE}${cursor}`);
      if (!res.ok) {
        const message = await res.text();
        throw new Error(
          message.replace(/["']/g, "") || "Could not load relics",
        );
      }
      return (await res.json()) as Post[];
    },
    [path],
  );

  useEffect(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setPosts([]);
    fetchPage()
      .then((page) => {
        if (id !== requestId.current) return;
        setPosts(page);
        setHasMore(page.length === PAGE_SIZE);
      })
      .catch((e: Error) => {
        if (id === requestId.current) setError(e.message);
      })
      .finally(() => {
        if (id === requestId.current) setIsLoading(false);
      });
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || posts.length === 0) return;
    const id = requestId.current;
    setIsLoadingMore(true);
    try {
      const page = await fetchPage(posts[posts.length - 1].id);
      if (id !== requestId.current) return;
      setPosts((prev) => [...prev, ...page]);
      setHasMore(page.length === PAGE_SIZE);
    } catch (e) {
      if (id === requestId.current) setError((e as Error).message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore, posts]);

  const removePost = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    removePost,
  };
}
