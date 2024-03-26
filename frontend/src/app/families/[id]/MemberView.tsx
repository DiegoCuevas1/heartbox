import { User } from "@/app/types/user";
import Image from "next/image";
import Link from "next/link";

type MemberListProps =
{
    members?: User[] | null;
    signedInUserId?:number;
}


export default function MemberList({members = [],signedInUserId}:MemberListProps){
    return(
        <div className="flex-col flex space-y-2">
            <h2 className="mx-auto text-3xl font-loves font-bold border-b-2 border-[#d31c60]">Members</h2>
            
            <div className="flex bg-[#f3d8e6] flex-col border-2 border-[#d31c60] rounded-xl overflow-auto max-h-[calc(40vh-80px)]">
                {members && members.length<1 && <p className="p-2">No other group members...</p>}
                {members && members.length>=1 &&members.map((member,index) => (
                    <div key={member.id} className="flex flex-col">
                        <div className="flex py-2 gap-2 px-12">
                            <Image
                                src="/images/default_profpic.png"
                                width={40}
                                height={100}
                                className="justify-center items-center"
                                alt=""
                            />
                            <p className="flex justify-center items-center ">
                                {member?.first_name} {member?.last_name}
                            </p>
                        </div>
                        {index !== members.length - 1 && <div className="h-[2px] w-full mx-0  bg-[#a15e78]" />}
                    </div>
                    
                    
                ))}

            </div>
            
            {members && members.length <= 4 && (
                    <div className="flex items-center justify-center text-center">
                            <button className="p-2 bg-[#D31C5F] w-28 flex font-loves font-bold text-white mt-3 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all"><span>Add more members</span>  <span className="text-center items-center justify-center pt-2 font-bold text-2xl">+</span></button>
                    </div>
            )}
            {members && members.length>4 && (
                <div className="flex">
                    <Link href={'/families'}>
                        View All Family Members
                    </Link>
                </div>
            )}
        </div>
    )
}