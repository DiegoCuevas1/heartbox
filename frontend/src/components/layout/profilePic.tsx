'use client'
import { useUserContext } from "@/context/AuthContext";
import Image from "next/image";
const ProfilePic = () =>
{
    const {userId, userFN, userLN, authStatus } = useUserContext();
    if (!userId) return <div>Loading ...</div>;
    if(!authStatus)
    {
        return(
            <>
            </>
        )
    }

    return(
        <>
            <div className="flex flex-col items-center justify-center">
                <Image className="h-14 w-14 justify-center" src="/images/default_profpic.png" alt="profile picture dropdown icon" />
                <p className="text-sm">My Profile</p>
            </div>
        </>
    )
}

export default ProfilePic;