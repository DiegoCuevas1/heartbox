// Sidebar.tsx (already provided in the previous responses)
"use client";
import { Family } from "@/app/types";
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toTitleCase } from "@/utils/utilFunctions";
import { BsThreeDots } from "react-icons/bs";
import Logout from "../logoutbtn";
import { BiPlus } from "react-icons/bi";
import Link from "next/link";

const Sidebar = () => {
  const { user, isAuthenticated } = useUserContext();
  const [data, setData] = useState<Family[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (isAuthenticated) {
      const fetchFamilies = async () => {
        try {
          const response = await fetch(
            "http://localhost:8000/api/user/families",
            {
              method: "GET",
              credentials: "include", // Assuming the user is logged in and session is stored
            }
          );

          if (response.ok) {
            const data = await response.json();
            setData(data); // Assuming the response has a 'families' field
          } else {
            console.error("Failed to fetch families");
          }
        } catch (error) {
          console.error("Error fetching families:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFamilies();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Don't render the sidebar if not authenticated
  }

  return (
    <div className="fixed top-0 right-0 w-64 h-screen  shadow-lg hidden lg:block">
      <div
        className="w-full h-full flex flex-col items-center border-l-4 border-transparent border-t-0 border-b-0 border-r-0 bg-gradient-to-b from-white via-white to-[#dadef0]"
        style={{
          borderImage: "linear-gradient(to bottom, #3f8fcb, transparent) 1",
        }}
      >
        <div className="mt-12 flex flex-col items-center">
          {/* Center the content */}
          <Image
            src="/images/icon-blue.png"
            alt="Heartbox Logo"
            className="w-16 h-16"
            width={50}
            height={50}
          />
        </div>
        {/* Sidebar content */}
        <div className="flex flex-col items-center mt-3">
          <h4 className="text-3xl">Heartboxes</h4>
          <div className="w-48 h-1 bg-[#368bca]" />

          <Link
            href={"/families/add-family"}
            className="flex items-center space-x-2"
          >
            <BiPlus className="text-center bg-[#368bca] text-white rounded-full " />
            <p>Add Heartbox</p>
          </Link>

          {loading ? (
            <p>Loading heartboxes...</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {data && data.length > 0 ? (
                data.map((family) => (
                  <div key={family.id}>
                    <Link
                      href={`/families/${family.id}`}
                      className="flex items-center space-x-4"
                    >
                      <Image
                        src={`https://res.cloudinary.com/dcyk5quni/${family.family_picture}`}
                        alt={`${family.family_name}'s profile picture`}
                        width={75}
                        height={75}
                        className="rounded-xl"
                      />
                      <li>{family.family_name}</li>
                    </Link>
                  </div>
                  // Render family name
                ))
              ) : (
                <p>No families found.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
