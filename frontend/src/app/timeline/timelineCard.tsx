'use client';
import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import { IconContext } from "react-icons";
import { FaRegHeart } from "react-icons/fa";

export default function TimelinePostCard({post}:{post:Post})
{
    const postDate = new Date(post.datePosted);
    const formattedDate = `${postDate.getMonth() + 1}-${postDate.getDate()}-${postDate.getFullYear()}`;

    return(
        <div className="flex-col flex">
            <div className="flex items-center space-x-2 px-4 ">
                <Link href={"/"}>
                    <Image
                        src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${post.user_details.profile_picture}`}
                        width={50}
                        height={50}
                        alt={`${post.user_details.first_name} ${post.user_details.last_name}'s profile picture`}
                        className="h-12 rounded-full"
                        style={{ objectFit: "cover" }}
                    />
                </Link>
                <div className="flex-col flex space-y-0 ">
                    <div className="grid grid-cols-7 gap-5">
                        <h2 className="font-loves col-span-3 font-bold"><Link href={'/'}>{post.user_details.first_name} {post.user_details.last_name}</Link></h2>
                        <div className="flex justify-end  items-center col-start-5 col-span-3">
                            <p className="border-2 text-sm border-[#d31c60] px-2 rounded-full font-loves font-bold ">
                                {formattedDate}
                            </p>
                        </div>
                        
                    </div>
                    <p className="font-bold"><Link href={`posts/${post.id}`}>{post.title}</Link></p>
                    <p className="font-bold text-links"><Link href={`families/${post.family_details.id}`}>{post.family_details.family_name}</Link></p>
                </div>
            </div>
            <p className="mx-4 mt-4 bg-[#fdeff1] flex border-2 border-[#d31c60] p-2 rounded-xl"><Link href={`posts/${post.id}`}>{post.message}</Link></p> 
            <div className="flex mt-2">
                <IconContext.Provider value={{ color: "d31c60",  size: '1.5em', className: `` }}>
                    <FaRegHeart className="hover:cursor-pointer"/>
                </IconContext.Provider>
            </div>
                    
        </div>
    )
}