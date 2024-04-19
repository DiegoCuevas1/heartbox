'use client';
import { User } from "@/app/types/user";
import Image from "next/image";
import Link from "next/link";
import { FaCopy } from "react-icons/fa";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type MemberListProps =
{
    members?: User[] | null;
    invite_code?: string | null;
}


export default function MemberList({members = [],invite_code}:MemberListProps){
   
    const [isModalOpen,setIsModalOpen] = useState(false);
    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsModalOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);

        // Remove event listener when component unmounts
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, []);
    const toggleModal = () =>
    {
        setIsModalOpen(!isModalOpen)
    }

    const handleCopy = () => {
        if (invite_code) {
            navigator.clipboard.writeText(invite_code)
                .then(() => toast.success('Invite code copied successfully!',{
                    style: {
                      backgroundColor: '#D31c60',
                      color:'#FFFFFF'
                    },}))
                .catch(error => toast.error('Failed to copy invite code:', error));
        }
    };
    return(
        <>
            <div className="flex-col justify-center flex space-y-2 mt-4 ">
                <h2 className="mx-auto text-3xl font-loves font-bold border-b-2 border-[#d31c60]">Members</h2>
                
                <div className="flex bg-[#f3d8e6] flex-col border-2 border-[#d31c60] rounded-xl overflow-auto max-h-[calc(40vh-80px)] mr-4">
                    {members && members.length<1 && <p className="p-2">No other group members...</p>}
                    {members && members.length>=1 &&members.map((member,index) => (
                        <div key={member.id} className="flex flex-col">
                            <div className="flex gap-2 items-center py-2 px-4 justify-center">
                                <Image
                                    src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${member.profile_picture}`}
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
                                <button className="p-2 bg-[#D31C5F] w-28 flex font-loves font-bold text-white mr-2 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] hover:scale-125 active:scale-90 transition-all" onClick={toggleModal}><span>Add more members</span>  <span className="text-center items-center justify-center pt-2 font-bold text-2xl">+</span></button>
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
                
            {isModalOpen &&
                <>
                    <div className="absolute w-full h-full bg-black opacity-25 flex justify-center items-center z-[50]" onClick={toggleModal}/>
                
                    <div className="flex-col flex bg-[#fae4ee] border-2 border-border w-96 h-96 rounded-xl z-[1000] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <p className="text-center bg-border rounded-t-lg text-white text-2xl font-loves font-bold items-center">Invite Friends to Family<span className="ml-4 font-sans hover:cursor-pointer" onClick={toggleModal}>X</span></p>
                        <div className="flex-col flex my-auto">
                            {/* {members && members.length>=1 &&members.map((member,index) => (
                                <div key={member.id} className="flex flex-col">
                                    <div className="flex gap-2 items-center py-2 px-4 justify-center">
                                        <Image
                                            src={`https://dev-heartbox.s3.us-east-2.amazonaws.com/profile_pics/${member.profile_picture}`}
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
                            ))} */}
                            <div className="flex justify-center items-center space-x-4">
                                
                                <div className="flex items-center space-x-1">
                                    <p className="font-loves font-bold">Invite Code:</p>
                                    <div className="flex items-center justify-center space-x-2 border-2 border-border px-2 rounded-xl">
                                        <p className="border-r-2 border-border pr-2 font-bold">{invite_code}</p>
                                        <FaCopy onClick={handleCopy} className="hover:cursor-pointer" />
                                    </div>
                                </div>
                                
                                
                            </div>
                            <button className="px-4 py-2 bg-[#D31C5F] text-xl mx-auto mt-2 font-loves font-bold text-white rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] hover:bg-[#e577a0] transition-all">Invite</button>
                        </div>
                    </div>
                </>
            }

        </>
    )
}