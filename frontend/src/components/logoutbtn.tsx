"use client";
import toast from "react-hot-toast";
import { navSignOut } from "@/utils/NavAuthToggle";


const Logout = () => {
  const getCSRF = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  const handleLogout = async () => {
    const csrfValue = getCSRF() ?? "";
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
    <button
      onClick={handleLogout}
      className="w-48 h-12 rounded-xl text-white drop-shadow-xl bg-default hover:cursor-pointer hover:bg-[#d94e60] active:scale-95 transition-all"
    >
      Logout
    </button>
  );
};

export default Logout;
