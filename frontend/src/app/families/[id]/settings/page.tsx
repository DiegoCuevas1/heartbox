"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, FormEvent, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Family } from "@/app/types";
import { apiFetch } from "@/utils/api";
import { cldImage } from "@/utils/media";
import { sanitize_res_msg } from "@/utils/utilFunctions";

export default function FamilySettings(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch(
      `/api/user/families?familyId=${encodeURIComponent(params.id)}`,
    );
    if (!res.ok) {
      router.push("/families");
      return;
    }
    const data: Family[] = await res.json();
    setFamily(data[0]);
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body: FormData | Record<string, unknown>) => {
    setIsSaving(true);
    try {
      const isForm = body instanceof FormData;
      const res = await apiFetch(`/api/user/families/${params.id}/settings`, {
        method: "PATCH",
        headers: isForm ? undefined : { "Content-Type": "application/json" },
        body: isForm ? body : JSON.stringify(body),
      });
      if (res.ok) {
        setFamily(await res.json());
        toast.success("Saved!");
      } else {
        toast.error(sanitize_res_msg(await res.text()));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const picture = form.get("family_picture");
    if (!(picture instanceof File) || picture.size === 0) {
      form.delete("family_picture");
    }
    save(form);
  };

  const removeMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this HeartBox?`)) return;
    const res = await apiFetch(
      `/api/user/families/${params.id}/remove-member`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      },
    );
    const msg = sanitize_res_msg(await res.text());
    if (res.ok) {
      toast.success(msg);
      load();
    } else toast.error(msg);
  };

  const leave = async () => {
    if (
      !confirm(
        "Leave this HeartBox? You'll lose access to its relics until someone invites you back.",
      )
    )
      return;
    const res = await apiFetch("/api/user/families/leave-family", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId: params.id }),
    });
    const msg = sanitize_res_msg(await res.text());
    if (res.ok) {
      toast.success(msg);
      router.push("/families");
    } else toast.error(msg);
  };

  if (!family) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto px-4 py-6 text-black">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-loves font-bold border-b-4 border-links">
          {family.family_name} settings
        </h2>
        <Link
          href={`/families/${family.id}`}
          className="text-links hover:underline"
        >
          Back
        </Link>
      </div>

      {family.is_creator ? (
        <form onSubmit={handleDetails} className="flex flex-col gap-3">
          <h3 className="text-xl font-bold">Details</h3>
          <label className="font-bold" htmlFor="family_name">
            Name
          </label>
          <input
            id="family_name"
            name="family_name"
            defaultValue={family.family_name}
            maxLength={250}
            required
            className="border-2 border-[#d31c60] rounded-md px-2 py-1"
          />
          <label className="font-bold" htmlFor="family_description">
            Description
          </label>
          <textarea
            id="family_description"
            name="family_description"
            defaultValue={family.family_description}
            maxLength={500}
            rows={3}
            className="border-2 border-[#d31c60] rounded-md px-2 py-1"
          />
          <label className="font-bold" htmlFor="family_picture">
            Picture
          </label>
          <div className="flex items-center gap-3">
            <Image
              unoptimized
              src={cldImage(family.family_picture, 128)}
              alt=""
              width={64}
              height={64}
              className="rounded-lg object-cover"
            />
            <input
              id="family_picture"
              name="family_picture"
              type="file"
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="self-start bg-[#d31c60] text-white font-bold rounded-lg px-4 py-2 disabled:opacity-60"
          >
            Save changes
          </button>
        </form>
      ) : (
        <p className="text-gray-600">
          Only the person who manages this HeartBox can change its details.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Invite code</h3>
        <p>
          Share this code with family so they can join:{" "}
          <span className="font-mono text-lg font-bold tracking-widest">
            {family.invite_code}
          </span>
        </p>
        {family.is_creator && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              if (confirm("Make a new code? The old one will stop working."))
                save({ regenerate_invite_code: true });
            }}
            className="self-start border-2 border-[#d31c60] text-[#d31c60] font-bold rounded-lg px-3 py-1"
          >
            Make a new code
          </button>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Members ({family.member_count})</h3>
        <ul className="flex flex-col gap-2">
          {(family.members ?? []).map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-2"
            >
              <Link
                href={`/profile/${member.id}`}
                className="flex items-center gap-2 hover:underline"
              >
                <Image
                  unoptimized
                  src={cldImage(member.profile_picture, 72)}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
                {member.first_name} {member.last_name}
              </Link>
              {family.is_creator && (
                <button
                  type="button"
                  onClick={() => removeMember(member.id, member.first_name)}
                  className="text-sm text-[#d31c60] hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 border-t pt-4">
        <button
          type="button"
          onClick={leave}
          className="self-start bg-white border-2 border-red-600 text-red-600 font-bold rounded-lg px-4 py-2"
        >
          Leave this HeartBox
        </button>
      </section>
    </div>
  );
}
