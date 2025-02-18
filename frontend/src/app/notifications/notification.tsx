"use client";
import Image from "next/image";
import { NotificationType } from "../types/notification";
import Link from "next/link";
import { useState } from "react";
import RemoveConnectionModal from "@/components/modals/RemoveConnectionModal";
import { MdNotificationsActive } from "react-icons/md";
import { IconContext } from "react-icons";

export default function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResponded, setIsResponded] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const GROUP_JOIN = "GROUP_JOIN";
  const POST_MENTION = "POST_MENTION";
  const GROUP_INVITATION = "GROUP_INVITATION";
  const CONNECTION_REQUEST = "CONNECTION_REQUEST";
  const CONNECTION_ACCEPTED = "CONNECTION_ACCEPTED";
  const COMMENT = "COMMENT";
  const LIKE = "LIKE";

  const handleConnectionResponse = async (action: "accept" | "decline") => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/connections/respond",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            connectionId: notification.connection_id,
            action: action,
            notificationId: notification.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to respond to connection request");
      }

      setIsResponded(true);
    } catch (error) {
      console.error("Error responding to connection request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col flex">
      <div className="flex text-lg items-center space-x-2">
        <Link href={`/profile/${notification.sender_details.id}`}>
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${notification.sender_details.profile_picture}`}
            alt={""}
            width={50}
            height={100}
            className="h-12 rounded-full "
            style={{ objectFit: "cover" }}
          />
        </Link>

        {notification.notification_type === GROUP_JOIN && (
          <p>
            <Link href={`/profile/${notification.sender_details.id}`}>
              {notification.sender_details.first_name}{" "}
              {notification.sender_details.last_name}
            </Link>{" "}
            joined group{" "}
            <span>
              <Link
                className="text-links"
                href={`/families/${notification.family_details.id}`}
              >
                {notification.family_details.family_name}
              </Link>
            </span>
          </p>
        )}

        {notification.notification_type === COMMENT && (
          <p>
            <span
              className="text-links hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/profile/${notification.sender_details.id}`}>
                {notification.sender_details.first_name}{" "}
                {notification.sender_details.last_name}
              </Link>
            </span>{" "}
            commented on your post: {notification.comment_message}
          </p>
        )}

        {notification.notification_type === LIKE && (
          <p>
            <span className="text-links hover:underline">
              <Link href={`/profile/${notification.sender_details.id}`}>
                {notification.sender_details.first_name}{" "}
                {notification.sender_details.last_name}
              </Link>
            </span>{" "}
            liked your post
          </p>
        )}

        {notification.notification_type === CONNECTION_ACCEPTED && (
          <div className="flex flex-col space-y-2">
            <p>
              <Link
                href={`/profile/${notification.sender_details.id}`}
                className="text-links hover:underline"
              >
                {notification.sender_details.first_name}{" "}
                {notification.sender_details.last_name}
              </Link>{" "}
              has connected with you
            </p>
            <button
              className="w-1/2 rounded-md px-4 py-1 border-2 border-links text-gray-900"
              onClick={() => setIsRemoveModalOpen(true)}
            >
              Connected
            </button>
            {isRemoveModalOpen && (
              <RemoveConnectionModal
                isOpen={isRemoveModalOpen}
                onConfirm={() => setIsRemoveModalOpen(false)}
                onClose={() => setIsRemoveModalOpen(false)}
                userName={
                  notification.sender_details.first_name +
                  " " +
                  notification.sender_details.last_name
                }
              />
            )}
          </div>
        )}

        {notification.notification_type === CONNECTION_REQUEST && (
          <div className="flex flex-col space-y-2 w-full">
            <p>
              {notification.sender_details.first_name}{" "}
              {notification.sender_details.last_name} has sent you a connection
              request.
            </p>
            {!isResponded && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleConnectionResponse("accept")}
                  disabled={isLoading}
                  className="bg-links text-white px-4 py-1 rounded-md hover:bg-[#407cad] transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Accept"}
                </button>
                <button
                  onClick={() => handleConnectionResponse("decline")}
                  disabled={isLoading}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Decline"}
                </button>
              </div>
            )}
            {isResponded && (
              <>
                <button
                  className="w-1/2 rounded-md px-4 py-1 border-2 border-links text-gray-900"
                  onClick={() => setIsRemoveModalOpen(true)}
                >
                  Connected
                </button>
                {isRemoveModalOpen && (
                  <RemoveConnectionModal
                    isOpen={isRemoveModalOpen}
                    onConfirm={() => setIsRemoveModalOpen(false)}
                    userName={
                      notification.sender_details.first_name +
                      " " +
                      notification.sender_details.last_name
                    }
                    onClose={() => setIsRemoveModalOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
