'use client';
import { MdNotificationsActive } from "react-icons/md";
import { IconContext } from "react-icons";
import Image from "next/image";
import { NotificationType } from "../types/notification";
import Link from "next/link";
export default function Notification({notification}:{notification:NotificationType})
{
    return(
        <>
            <div className="flex-col flex">
                <div className="flex text-lg space-x-2 items-center ml-5">
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `` }}>
                            <MdNotificationsActive />
                        </IconContext.Provider>
                        <p><Link className='text-links' href={"/"}>{notification.user_details.first_name}</Link> {notification.content}</p>
                        <Image src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${notification.user_details.profile_picture}`} alt={""} width={50} height={50} className="w-10 mt-[-12px]"/>
                </div>
                <div className="h-[1px] bg-[#fbd3d3] mt-2 "/>
            </div>
        </>
    )
}