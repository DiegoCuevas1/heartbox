"use client";
import toast from "react-hot-toast";
import { navSignOut } from "@/utils/NavAuthToggle";
import { useUserContext } from "@/context/AuthContext";
import getCSRF from "@/utils/cookie";



const Logout = () => {
  
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
        toast.success(res_mesg);
        navSignOut();
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
        className="w-[170px] h-[40px] border-white border-2 rounded-[25px] text-white drop-shadow-xl bg-[#CA384B] hover:cursor-pointer hover:bg-[#d94e60] active:scale-95 transition-all"
        >
        Logout
        </button>)}
    </>
  );
};

export default Logout;
