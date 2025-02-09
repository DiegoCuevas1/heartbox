"use client";
import toast from "react-hot-toast";
import getCSRF from "@/utils/cookie";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

const LogoutButton = () => {
  const router = useRouter();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const handleLogout = async () => {
    const csrfValue = getCSRF() ?? "";
    try {
      setShowLoadingOverlay(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        window.location.href = "/home";
      } else {
        setShowLoadingOverlay(false);
        toast.error(res_mesg);
      }
    } catch (error) {
      setShowLoadingOverlay(false);
      toast.error("An error occurred while making your request");
      console.log((error as Error).toString());
    }
  };

  return (
    <>
      {showLoadingOverlay && <LoadingOverlay />}
      <button
        onClick={handleLogout}
        className="py-2 text-gray-900 w-full hover:bg-gray-100 hover:text-red-500 transition-colors"
      >
        Logout
      </button>
    </>
  );
};

export default LogoutButton;
