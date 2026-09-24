"use client";

import { useEffect, useRef } from "react";

type LoadMoreProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

/** Loads the next page when scrolled into view, with a button as a fallback. */
export default function LoadMore({
  hasMore,
  isLoading,
  onLoadMore,
}: LoadMoreProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-6">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border-2 border-links text-links font-bold disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Load more relics"}
      </button>
    </div>
  );
}
