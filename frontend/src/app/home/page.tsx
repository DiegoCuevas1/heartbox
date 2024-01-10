'use client';
import { useUserContext } from "@/context/AuthContext";
import Link from "next/link"
import Button from "@/components/button"
import Logout from "@/components/logoutbtn"
export default function Home() {
    const context = useUserContext();
    if (!context) return <div>Loading ...</div>;

    const { userFN, authStatus } = context;
    return (
      <main className="justify-center flex">
        <div className="flex flex-col space-y-4">
            <Link href="/auth/sign-up"><Button text="Signup" /></Link>
            <Link href="/auth/sign-in"><Button text="Login"/></Link>
            {authStatus &&
            <>
              <p>Hello {userFN}</p>
              <Logout />
            </>}
        </div>
      </main>
    )
  }
  