import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";

export default function PostCard({post}:{post:Post})
{
    const postDate = new Date(post.datePosted);
    const formattedDate = `${postDate.getMonth() + 1}-${postDate.getDate()}-${postDate.getFullYear()}`;

    return(
        <div className="flex-col flex">
            <div className="flex items-center space-x-2 px-4 ">
                <Image
                    src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${post.user_details.profile_picture}`}
                    width={50}
                    height={50}
                    alt="Heartbox Home Page Logo"
                />
                
                <div className="flex-col flex space-y-0 ">
                    <div className="grid grid-cols-7 gap-5">
                        <h2 className="font-loves col-span-3 font-bold">{post.user_details.first_name} {post.user_details.last_name}</h2>
                        <div className="flex justify-end  items-center col-start-5 col-span-3">
                            <p className="border-2 text-sm border-[#d31c60] px-2 rounded-full font-loves font-bold ">
                                {formattedDate}
                            </p>
                        </div>
                        
                    </div>
                    <p className="mt-2 font-bold">{post.title}</p>
                </div>
            </div>
            <p className="mx-4 mt-4 bg-[#fdeff1] flex border-2 border-[#d31c60] p-2 rounded-xl">{post.message}</p> 
            <div className="h-[1px] bg-[#fbd3d3] mt-2 "/>
        </div>
    )
}