'use client';
import { MdNotificationsActive } from "react-icons/md";
import { IconContext } from "react-icons";
import Image from "next/image";
import { NotificationType } from "../types/notification";
import Link from "next/link";
export default function Notification({notification}:{notification:NotificationType})
{
    const GROUP_JOIN = 'GROUP_JOIN';
    const POST_MENTION = 'POST_MENTION';
    const GROUP_INVITATION ='GROUP_INVITATION'
    return(
        <>
            <div className="flex-col flex">
                <div className="flex text-lg space-x-2 items-center ml-5">
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `` }}>
                            <MdNotificationsActive />
                        </IconContext.Provider>
                        {notification.notification_type===GROUP_JOIN &&
                        <p> {notification.sender_details.first_name} {notification.sender_details.last_name} joined group <span> </span>
                            <Link className="text-links" href={`/families/${notification.family_details&&notification.family_details.id}`}>
                            {notification.family_details && notification.family_details.family_name}
                            </Link>
                        </p>
                        }
                        <Image src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${notification.sender_details.profile_picture}`} alt={""} width={50} height={100} className="h-12 rounded-full " style={{objectFit:'cover'}}/>
                </div>
                <div className="h-[1px] bg-[#fbd3d3] mt-2 "/>
            </div>
        </>
    )
}