"use client";
import toast from "react-hot-toast";
import { navSignOut } from "@/utils/NavAuthToggle";
import { useUserContext } from "@/context/AuthContext";
import getCSRF from "@/utils/cookie";
import { redirect, useRouter } from "next/navigation";
import sanitize_res_msg from "@/utils/utilFunctions";



const Logout = () => {
  const router = useRouter()
  
  const context = useUserContext();
    if (!context) return <div>Loading ...</div>;

    const { userFN, authStatus } = context;
  const handleLogout = async () => {
    const csrfValue = getCSRF() ?? ""
    try {
      const res = await fetch("http://localhost:8000/api/user/logout", {
        headers: {
          "X-CSRFToken": csrfValue,
        },
        method: "DELETE",
        credentials: "include",
      });
      const res_mesg = await res.text();
      if (res.ok) {
        toast.success(sanitize_res_msg(res_mesg));
        navSignOut();
        router.push('/home')
      } else toast.error(res_mesg);
    } catch (error) {
      toast.error("An error occured while making your request");
      console.log((error as Error).toString());
    }
  };

  return (
    <>
    
      {authStatus && (  <button
        onClick={handleLogout}
        className="flex space-x-2 py-1 px-4 rounded-sm text-white drop-shadow-xl font-loves font-bold text-xl bg-[#d31c60] hover:cursor-pointer active:scale-95 transition-all"
        >
          <svg
        fill="#ffffff"
        height="1.5em" 
        width="1em" 
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 384.971 384.971"
        xmlSpace="preserve"
      >
       
        <g>
          <g id="Sign_Out">
            <path d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03
                C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03
                C192.485,366.299,187.095,360.91,180.455,360.91z"/>
            <path d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279
                c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179
                c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z"/>
          </g>
        </g>
      </svg>
        <p>Logout</p>
        </button>)}
    </>
  );
};

export default Logout;
