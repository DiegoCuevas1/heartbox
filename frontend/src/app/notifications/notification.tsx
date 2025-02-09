"use client";
import { MdNotificationsActive } from "react-icons/md";
import { IconContext } from "react-icons";
import Image from "next/image";
import { NotificationType } from "../types/notification";
import Link from "next/link";
import { CONNREFUSED } from "dns";
export default function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const GROUP_JOIN = "GROUP_JOIN";
  const POST_MENTION = "POST_MENTION";
  const GROUP_INVITATION = "GROUP_INVITATION";
  const CONNECTION_REQUEST = "CONNECTION_REQUEST";
  return (
    <>
      <div className="flex-col flex">
        <div className="flex text-lg items-center mx-1 space-x-2">
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${notification.sender_details.profile_picture}`}
            alt={""}
            width={50}
            height={100}
            className="h-12 rounded-full "
            style={{ objectFit: "cover" }}
          />
          {notification.notification_type === GROUP_JOIN && (
            <p>
              {" "}
              {notification.sender_details.first_name}{" "}
              {notification.sender_details.last_name} joined group{" "}
              <span> </span>
              <Link
                className="text-links"
                href={`/families/${notification.family_details.id}`}
              >
                {notification.family_details.family_name}
              </Link>
            </p>
          )}

          {notification.notification_type === CONNECTION_REQUEST && (
            <p>
              {" "}
              {notification.sender_details.first_name}{" "}
              {notification.sender_details.last_name} has sent you a connection
              request.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
