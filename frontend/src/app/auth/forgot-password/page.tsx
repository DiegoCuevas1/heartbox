"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { sanitize_res_msg } from "@/utils/utilFunctions";

export default function ForgotPasswordPage() {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setIsSending(true);
    try {
      const res = await apiFetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const msg = sanitize_res_msg(await res.text());
      if (res.ok) {
        setSent(true);
        toast.success(msg);
      } else {
        toast.error(msg);
      }
    } catch {
      toast.error("Could not reach HeartBox. Try again in a moment.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 text-black">
      <h2 className="pb-6 font-loves font-bold text-3xl text-center">
        <span className="border-b-2 border-[#D31c60]">Reset your password</span>
      </h2>
      {sent ? (
        <p className="max-w-md text-center text-lg">
          If that email has a HeartBox account, we&apos;ve sent a link to reset
          your password. Check your inbox (and spam folder).
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <label className="font-bold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border-2 border-[#d31c60] rounded-md px-2 py-1"
          />
          <button
            type="submit"
            disabled={isSending}
            className="bg-[#d31c60] text-white font-loves font-bold text-xl rounded-xl py-2 disabled:opacity-60"
          >
            {isSending ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <Link href="/auth/sign-in" className="mt-6 text-links hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
