'use client'
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Landing = () => {
  const { authStatus } = useUserContext();
  const router = useRouter();
  if (authStatus) {
    router.push('/families');
    return (
      <div>
        <p>You are already logged in. Redirecting...</p>
      </div>
    );
  }
  else
  {
    router.push('/home');
  }
};

export default Landing;
