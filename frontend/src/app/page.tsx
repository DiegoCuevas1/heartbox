'use client'
import { useEffect } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Landing = () => {
  const { authStatus } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (authStatus) {
      router.push('/families');
    } else {
      router.push('/home');
    }
  }, [authStatus, router]);

  return null; // or any other JSX if needed
};

export default Landing;
