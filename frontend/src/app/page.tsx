'use client'
import { useUserContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";

const Landing = () => {
  const context = useUserContext();
  if (!context) return <div>Loading ...</div>;
  const {authStatus} = context;
  if(!authStatus)
  {
    redirect("/home");
  }
   
  if(authStatus)
  {
    redirect("/families")
  }

};

export default Landing;
