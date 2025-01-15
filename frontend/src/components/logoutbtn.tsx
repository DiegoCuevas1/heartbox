"use client";
import toast from "react-hot-toast";
import getCSRF from "@/utils/cookie";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

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
        toast.success(sanitize_res_msg(res_mesg));

        // Try multiple approaches to ensure navigation works
        await Promise.all([router.push("/home"), router.replace("/home")]);

        setTimeout(() => {
          window.location.href = "/home";
        }, 100);
      } else {
        toast.error(res_mesg);
      }
    } catch (error) {
      toast.error("An error occurred while making your request");
      console.log((error as Error).toString());
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
