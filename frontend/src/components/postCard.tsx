import { Post } from "@/app/types/post";
import Image from "next/image";

export default function PostCard({post}:{post:Post})
{
    const postDate = new Date(post.post_details.datePosted);
    const formattedDate = `${postDate.getMonth() + 1}-${postDate.getDate()}-${postDate.getFullYear()}`;

    return(
        <div className="flex-col flex space-y-2">
            <div className="flex items-center space-x-2 px-4 ">
                <Image width={45} height={45} src={"/images/default_profpic.png"} alt={`${post.user_details.first_name} ${post.user_details.last_name}'s profile picture`} /> 
                
                <div className="flex-col flex space-y-0 ">
                <div className="grid grid-cols-7 gap-5">
                    <h2 className="font-loves col-span-3 font-bold">{post.user_details.first_name} {post.user_details.last_name}</h2>
                    <div className="flex justify-end col-start-6 col-span-3">
                        <p className="border-2 px-2 text-sm border-[#d31c60] rounded-full font-loves font-bold mr-4">
                            {formattedDate}
                        </p>
                    </div>
                </div>
                    <p className="mt-2 font-bold">{post.post_details.title}</p>
                </div>
            </div>
            <p className="mx-4 bg-[#fdeff1] flex border-2 border-[#d31c60] p-2 rounded-xl">{post.post_details.message}</p> 
        </div>
    )
}