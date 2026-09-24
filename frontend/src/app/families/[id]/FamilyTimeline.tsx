"use client";
import Link from "next/link";
import { usePostFeed } from "@/hooks/usePostFeed";
import LoadMore from "@/components/LoadMore";
import TimelinePostCard from "@/app/timeline/timelineCard";
type FamilyTimelineProps = {
  id: string | undefined;
};

export default function FamilyTimeline({ id }: FamilyTimelineProps) {
  const { posts, isLoading, isLoadingMore, hasMore, error, loadMore } =
    usePostFeed(
      id ? `/api/user/posts?familyId=${encodeURIComponent(id)}` : null,
    );
  return (
    <div className="flex-col flex">
      <div className="h-2  mx-4 rounded-xl bg-links"></div>
      <div className={`flex-col mt-1 ${posts.length < 3 && "pb-48"}`}>
        {isLoading && (
          <div className="flex justify-center items-center">
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="flex-col flex justify-center space-y-2 items-center text-2xl w-full pb-60">
            <p>You are not a part of this family.</p>
          </div>
        )}
        {!isLoading && !error && posts.length == 0 && (
          <div className="flex-col flex justify-center space-y-2 items-center text-2xl w-full pb-60">
            <p>Be the first to add a relic to this HeartBox!</p>
            <Link href={`/create-post?familyId=${id}`}>
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Add a Relic
              </button>
            </Link>
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex-col mt-2">
            <TimelinePostCard post={post} />
          </div>
        ))}
        <LoadMore
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={loadMore}
        />

        {posts.length >= 1 && (
          <div className="flex justify-center items-center mt-4 ">
            <Link href={`/create-post?familyId=${id}`}>
              <button className="p-2 bg-[#4D94D0] w-36 text-xl font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                Add a Relic
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
