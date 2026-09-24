"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Post } from "@/app/types/post";
import TimelinePostCard from "@/app/timeline/timelineCard";
import { apiFetch } from "@/utils/api";
import { cldImage } from "@/utils/media";

type SearchResults = {
  people: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
  }[];
  families: { id: number; family_name: string; family_picture: string }[];
  relics: Post[];
};

function Results() {
  const q = useSearchParams().get("q")?.trim() ?? "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    apiFetch(`/api/user/search?q=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (q.length < 2) {
    return (
      <p className="text-center text-gray-600">
        Type at least 2 letters to search.
      </p>
    );
  }
  if (isLoading || !results) {
    return <p className="text-center text-gray-600">Searching...</p>;
  }

  const empty =
    results.people.length + results.families.length + results.relics.length ===
    0;
  if (empty) {
    return (
      <p className="text-center text-gray-600">
        Nothing matched &ldquo;{q}&rdquo;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {results.people.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-2">People</h3>
          <ul className="flex flex-col gap-2">
            {results.people.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/profile/${person.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Image
                    unoptimized
                    src={cldImage(person.profile_picture, 72)}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  {person.first_name} {person.last_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {results.families.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-2">HeartBoxes</h3>
          <ul className="flex flex-col gap-2">
            {results.families.map((family) => (
              <li key={family.id}>
                <Link
                  href={`/families/${family.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Image
                    unoptimized
                    src={cldImage(family.family_picture, 72)}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-lg object-cover"
                  />
                  {family.family_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {results.relics.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-2">Relics</h3>
          <div className="flex flex-col gap-2">
            {results.relics.map((post) => (
              <TimelinePostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-6 py-4 text-black">
      <h2 className="text-3xl font-loves font-bold border-b-4 border-links self-start">
        Search
      </h2>
      <Suspense>
        <Results />
      </Suspense>
    </div>
  );
}
