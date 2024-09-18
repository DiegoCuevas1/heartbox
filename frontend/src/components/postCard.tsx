'use client';
import { Family } from "@/app/types";
import { Post } from "@/app/types/post";
import { getTimeSincePost } from "@/utils/utilFunctions";
import Image from "next/image";
import Link from "next/link";
import { IconContext } from "react-icons";
import { FaRegHeart } from "react-icons/fa";

export default function PostCard({post}:{post:Post})
{
    const postDate = new Date(post.datePosted);
    const estOffset = -4 * 60;
    const estTime = new Date(postDate.getTime() + estOffset * 60000)
    const timePosted = estTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formattedDate=`${postDate.getMonth() + 1}/${postDate.getDate()}/${postDate.getFullYear().toString().slice(-2)}`
    return(
        <div className="flex-col flex border-b-[1px] border-grayrgb">
            <div className="flex items-center space-x-2 px-4 ">
                <Link href={``}>
                    <Image
                        src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${post.user_details.profile_picture}`}
                        width={50}
                        height={50}
                        alt={`${post.user_details.first_name} ${post.user_details.last_name}'s profile picture`}
                        className="h-12 rounded-full"
                        style={{ objectFit: "cover" }}
                    />
                </Link>
                <div className="flex justify-between">
                    <div className="flex-col ">
                        <h2  className={`flex`}><Link href={'/'}>{post.user_details.first_name} {post.user_details.last_name}</Link></h2>
                        <p className="font-bold text-links"><Link href={`families/${post.family_details.id}`}>{post.family_details.family_name}</Link></p>
                    </div>
                </div>
            </div>
            <p className="mx-4 flex ml-16 p-2">{post.message}</p> 
            <div className="justify-start flex ml-3 "><span className="ml-2 text-secondary">{timePosted} {formattedDate}</span></div>
            <div className="flex"></div>
            {/* <div className="flex mt-2">
                <IconContext.Provider value={{ color: "d31c60",  size: '1.5em', className: `` }}>
                    <FaRegHeart className="hover:cursor-pointer"/>
                </IconContext.Provider>
            </div> */}
        </div>
    )
}