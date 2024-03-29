import { Post } from "@/app/types/post";
import Image from "next/image";

export default function FamilyPostCard({post}:{post:Post})
{
    return(
        <div className="flex-col flex my-4 space-y-2 ">
            <div className="flex items-center space-x-2 px-4 ">
                <Image width={45} height={45} src={"/images/default_profpic.png"} alt={`${post.user_details.first_name} ${post.user_details.last_name}`} /> 
                
                <div className="flex-col flex space-y-0 ">
                    <div className="grid grid-cols-7" >
                        <h2 className="font-loves col-span-4 font-bold">{post.user_details.first_name} {post.user_details.last_name}</h2>
                        <p className="border-2 col-start-6 px-2 col-span-2 text-sm  border-[#d31c60] rounded-full font-loves font-bold ">{post.post_details.datePosted}</p>
                    </div>
                    <p className="mt-2 font-bold">{post.post_details.title}</p>
                </div>
            </div>
            <p className="mx-4 bg-[#fdeff1] flex border-2 border-[#d31c60] p-2 rounded-xl">{post.post_details.message}</p> 
        </div>
    )
}