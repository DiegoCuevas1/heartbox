'use client'
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Landing = () => {
  const { authStatus } = useUserContext();
  const router = useRouter();
  if (authStatus) {
    router.push('/families');
  }
  else
  {
    router.push('/home');
  }
};

export default Landing;
