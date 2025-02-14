"use client";
import { Family } from "@/app/types";
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import Link from "next/link";

const Sidebar = () => {
  const { isAuthenticated } = useUserContext();
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
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setData(data);
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
    return <></>; // Don't render the sidebar if not authenticated
  }

  return (
    <div className="h-full w-72 bg-white border-l-2 z-10">
      <div className="w-full h-full flex flex-col items-center ">
        <div className="flex flex-col items-center">
          <Image
            src="/images/icon-blue.png"
            alt="Heartbox Logo"
            className="w-14 h-14"
            width={50}
            height={50}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <div className="flex flex-col items-center mt-3">
          <h4 className="text-3xl">Heartboxes</h4>
          <div className="w-48 h-1 bg-[#368bca]" />

          <Link
            href={"/families/add-family"}
            className="flex items-center space-x-2"
          >
            <BiPlus className="text-center bg-[#368bca] text-white rounded-full" />
            <p>Add Heartbox</p>
          </Link>

          {loading ? (
            <p>Loading heartboxes...</p>
          ) : (
            <ul className="max-h-[600px] overflow-y-auto space-y-2 rounded-xl families-list">
              {data && data.length > 0 ? (
                data.map((family) => (
                  <div key={family.id}>
                    <Link
                      href={`/families/${family.id}`}
                      className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-200"
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
