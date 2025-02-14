"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const { isAuthenticated } = useUserContext();
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      // Handle forgot password logic here
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const email = formData.get("email");
      try {
        const res = await fetch(
          "http://localhost:8000/api/user/forgot-password",
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ email }),
          }
        );
        const res_msg = await res.text();
        if (res.ok) {
          toast.success("Password reset link sent to your email.");
        } else {
          toast.error(sanitize_res_msg(res_msg));
        }
      } catch (error) {
        toast.error(sanitize_res_msg((error as Error).toString()));
      }
    } else {
      // Handle sign in logic here
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const data = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
      try {
        const res = await fetch("http://localhost:8000/api/user/sign-in", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
          credentials: "include",
        });
        const res_msg = await res.text();
        if (res.ok) {
          toast.success("Welcome back!");
          setTimeout(() => {
            window.location.href = "/timeline";
          }, 400);
        } else {
          toast.error(sanitize_res_msg(res_msg));
        }
      } catch (error) {
        toast.error(sanitize_res_msg((error as Error).toString()));
      }
    }
  };

  if (isAuthenticated) {
    redirect("/timeline");
  }
  return (
    <div className="max-h-screen w-full relative bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
        style={{
          backgroundImage: "url(/images/home_family.jpg)",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      ></div>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-end px-2 sm:px-4 lg:px-6 z-50">
          <div className="max-w-5xl mr-[10%] relative z-50">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 bg-white/50 p-4 rounded-lg items-center relative z-50"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center  md:text-right"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-default mb-8 shine-effect">
                  Leave Your Mark Today
                </h1>
                <p className="text-xl text-black">
                  Create, preserve, and share precious family memories in a
                  beautiful digital space designed for generations to come.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-md"
              >
                <div className="flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="flex flex-col items-center">
                    <Image
                      src="/images/icon-blue.png"
                      alt="Heartbox Logo"
                      width={80}
                      height={80}
                      className="mb-4"
                    />
                    <h2 className="text-4xl font-bold text-default mb-8">
                      Heartbox
                    </h2>
                  </div>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 bg-white p-8 rounded-2xl shadow-sm mx-4 md:mx-8 form-transition"
                >
                  <motion.div
                    className="mb-4 form-element"
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 text-left mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="text"
                      name="email"
                      required
                      maxLength={50}
                      placeholder="Email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-links focus:border-links input-transition"
                    />
                  </motion.div>
                  <AnimatePresence mode="wait" initial={false}>
                    {!isForgotPassword && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, scale: 0.95 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          scale: 1,
                          transition: {
                            height: { duration: 0.3, ease: "easeOut" },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.1 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          scale: 0.95,
                          transition: {
                            height: { duration: 0.3, ease: "easeInOut" },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.1 },
                          },
                        }}
                        className="overflow-hidden form-element"
                      >
                        <div className="mb-4">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 text-left mb-1"
                          >
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            name="password"
                            required={!isForgotPassword}
                            maxLength={50}
                            placeholder="Password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-links focus:border-links input-transition"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button
                    type="submit"
                    className="w-full bg-links text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 button-transition"
                    layout="position"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {isForgotPassword ? "Send Reset Link" : "Sign In"}
                  </motion.button>
                  <motion.div
                    className="text-center form-element"
                    layout="position"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="text-gray-600">Don&apos;t have an account?</p>
                    <Link
                      href="/sign-up"
                      className="text-links font-semibold hover:text-blue-700 link-transition"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                  <AnimatePresence mode="wait" initial={false}>
                    {isForgotPassword ? (
                      <motion.div
                        key="remember"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                        className="text-center mt-4 form-element"
                      >
                        <p
                          onClick={() => setIsForgotPassword(false)}
                          className="text-links font-semibold hover:text-blue-700 link-transition cursor-pointer"
                        >
                          Remember Password?
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="forgot"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                        }}
                        className="text-center mt-4 form-element"
                      >
                        <p
                          onClick={() => setIsForgotPassword(true)}
                          className="text-links font-semibold hover:text-blue-700 link-transition cursor-pointer"
                        >
                          Forgot Password?
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className=" px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Photo Albums</h3>
                <p className="text-gray-600">
                  Create beautiful digital albums to preserve your family&apos;s
                  precious moments.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">Family Tree</h3>
                <p className="text-gray-600">
                  Build and explore your family tree with our intuitive
                  interface.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Stories & Comments
                </h3>
                <p className="text-gray-600">
                  Share stories and memories with family members through our
                  interactive platform.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
