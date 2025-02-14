"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import ProfileTimeline from "./profileTimeline";
import { User } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConnectionsModal from "@/components/modals/ConnectionsModal";
import RemoveConnectionModal from "@/components/modals/RemoveConnectionModal";

async function getData(userId: string) {
  try {
    const res = await fetch(
      `http://localhost:8000/api/user/users?userId=${userId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      // Handle error cases
      throw Error("You are not a member of this family");
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    return error; // Rethrow the error to be caught by the calling code
  }
}

export default function Profile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>();
  const [connectionStatus, setConnectionStatus] = useState<string>("none");
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnectionModalOpen, setIsConnectionModalOpen] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUserContext();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);
  const [isIncomingRequest, setIsIncomingRequest] = useState<boolean>(false);

  const toggleConnectionModal = () => {
    setIsConnectionModalOpen((prev) => !prev);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData(params.id);
        setUser(fetchedData);
        setConnectionStatus(fetchedData.connectionStatus || "none");
        setIsIncomingRequest(fetchedData.isIncomingRequest || false);
        setError(null);
      } catch (error: any) {
        setError(error.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOwnProfile(currentUser?.id === params.id);
    fetchData();
  }, [params.id, currentUser]);

  const sendConnectionRequest = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: params.id }), // Send the user ID in the request body
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to send connection request");
      }

      // Update the connection status to pending
      setConnectionStatus("PENDING");
    } catch (error: any) {
      console.error(error.message); // Handle error (e.g., show an error message)
    }
  };

  const cancelConnectionRequest = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/connections/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: params.id }), // Send the user ID in the request body
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to cancel connection request");
      }

      // Update the connection status to none or whatever is appropriate
      setConnectionStatus("none");
    } catch (error: any) {
      console.error(error.message); // Handle error (e.g., show an error message)
    }
  };

  const acceptConnectionRequest = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/connections/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: user?.connectionId,
          action: "accept",
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to accept connection request");
      }

      // Update the connection status to accepted
      setConnectionStatus("ACCEPTED");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const declineConnectionRequest = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/connections/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: user?.connectionId,
          action: "decline",
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to decline connection request");
      }

      // Update the connection status to none
      setConnectionStatus("none");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const removeConnection = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/connections/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: params.id }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to remove connection");
      }

      // Update the connection status to none
      setConnectionStatus("none");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-links"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-links text-white px-4 py-2 rounded-md hover:bg-[#407cad] transition-all duration-300"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-center space-x-24">
        <div className="flex flex-col items-center">
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${user?.profile_picture}`}
            width={100}
            height={100}
            alt="Profile Picture"
            className="w-16 h-16 rounded-full mx-auto object-cover"
          />
          <h2 className="text-xl">
            {user?.first_name} {user?.last_name}
          </h2>
          <div className="flex-col mx-auto justify-center">
            {isOwnProfile && (
              <div className="flex items-center justify-center">
                <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-1 mt-2 rounded-md active:scale-90">
                  Edit Profile Picture
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div>
            <h2 className="text-xl text-center font-loves font-bold">
              Connections
            </h2>
            <div className="w-full h-1 bg-links mt-1" />
            <p
              className="text-xl text-center font-semibold hover:text-links hover:cursor-pointer"
              onClick={toggleConnectionModal}
            >
              {user?.connection_count} connections
            </p>
            <ConnectionsModal
              isOpen={isConnectionModalOpen}
              onClose={() => setIsConnectionModalOpen(false)}
              userId={params.id}
            />
          </div>

          {user?.families && (
            <div>
              <h2 className="text-xl text-center font-loves font-bold">
                FAMILIES
              </h2>
              <div className="w-full h-1 bg-links mt-1" />
              <Link
                className="text-xl font-semibold hover:text-links transition-colors duration-300"
                href={"/families"}
              >
                {user.families.length} families
              </Link>
            </div>
          )}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="flex justify-center mt-4 space-x-4">
          {connectionStatus === "ACCEPTED" ? (
            <button
              onClick={() => setIsRemoveModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all duration-300 active:scale-90"
            >
              Remove Connection
            </button>
          ) : connectionStatus === "PENDING" ? (
            isIncomingRequest ? (
              <div className="space-x-4">
                <button
                  onClick={acceptConnectionRequest}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all duration-300 active:scale-90"
                >
                  Accept Request
                </button>
                <button
                  onClick={declineConnectionRequest}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all duration-300 active:scale-90"
                >
                  Decline Request
                </button>
              </div>
            ) : (
              <button
                onClick={cancelConnectionRequest}
                className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-4 py-2 rounded-md active:scale-90"
              >
                Cancel Request
              </button>
            )
          ) : (
            <button
              onClick={sendConnectionRequest}
              className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-4 py-2 rounded-md active:scale-90"
            >
              Add Connection
            </button>
          )}
          <button className="bg-links text-white hover:bg-[#407cad] transition-all duration-300 px-4 py-2 rounded-md active:scale-90">
            Send Message
          </button>
        </div>
      )}

      <RemoveConnectionModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={removeConnection}
        userName={`${user?.first_name} ${user?.last_name}`}
      />

      <div className="flex w-full items-center justify-between mt-8">
        <div className="w-full border-t border-pink-700" />
        <h2 className="text-xl mx-4 text-center">PERSONAL RELICS</h2>
        <div className="w-full border-t border-pink-700" />
      </div>

      <div className="flex-col  justify-center items-center flex">
        <ProfileTimeline id={params.id} />
      </div>
    </div>
  );
}
