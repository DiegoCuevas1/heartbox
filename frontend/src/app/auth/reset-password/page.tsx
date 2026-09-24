"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { sanitize_res_msg } from "@/utils/utilFunctions";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const uid = params.get("uid");
  const token = params.get("token");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    if (password !== form.get("confirm_password")) {
      toast.error("Passwords don't match");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiFetch("/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, password }),
      });
      const msg = sanitize_res_msg(await res.text());
      if (res.ok) {
        toast.success(msg);
        router.push("/auth/sign-in");
      } else {
        toast.error(msg);
      }
    } catch {
      toast.error("Could not reach HeartBox. Try again in a moment.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!uid || !token) {
    return (
      <p className="text-center">
        This reset link is incomplete.{" "}
        <Link href="/auth/forgot-password" className="text-links underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <label className="font-bold" htmlFor="password">
        New password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        className="border-2 border-[#d31c60] rounded-md px-2 py-1"
      />
      <label className="font-bold" htmlFor="confirm_password">
        Confirm new password
      </label>
      <input
        id="confirm_password"
        name="confirm_password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        className="border-2 border-[#d31c60] rounded-md px-2 py-1"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="bg-[#d31c60] text-white font-loves font-bold text-xl rounded-xl py-2 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-black">
      <h2 className="pb-6 font-loves font-bold text-3xl text-center">
        <span className="border-b-2 border-[#D31c60]">
          Choose a new password
        </span>
      </h2>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
