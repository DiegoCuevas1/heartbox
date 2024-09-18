'use client';
import { useEffect } from 'react';
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Landing = () => {
  const { authStatus } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (authStatus) {
      router.push('/timeline');
    } else {
      router.push('/home');
    }
  }, [authStatus, router]);

  return null; // No need for any TSX here since the redirection is handled in useEffect
};

export default Landing;