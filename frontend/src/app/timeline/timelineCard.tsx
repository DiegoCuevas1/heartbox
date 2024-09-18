'use client';
import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import { IconContext } from "react-icons";
import { FaRegHeart } from "react-icons/fa";
import { getTimeSincePost } from "@/utils/utilFunctions";

export default function TimelinePostCard({post}:{post:Post})
{
    const postDate = new Date(post.datePosted);
    const timeSincePost = getTimeSincePost(postDate)
    
    return(
        <Link href={`/posts/${post.id}`}>
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
                            <h2  className={`flex`}><Link href={'/'}>{post.user_details.first_name} {post.user_details.last_name}</Link><span className="ml-2 text-date">{timeSincePost}</span></h2>
                            <p className="text-secondary">Posted in <Link className="text-links font-bold" href={`families/${post.family_details.id}`}>{post.family_details.family_name}</Link> family</p>
                        </div> 
                    </div>
                </div>
                <p className="ml-16 flex pl-2 my-1"><Link href={`posts/${post.id}`}>{post.message}</Link></p> 
                {/* <div className="flex mt-2">
                    <IconContext.Provider value={{ color: "d31c60",  size: '1.5em', className: `` }}>
                        <FaRegHeart className="hover:cursor-pointer"/>
                    </IconContext.Provider>
                </div> */}
            </div>
        </Link>
    )
}