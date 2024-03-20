'use client'
import { useUserContext } from "@/context/AuthContext";

const ProfilePic = () =>
{
    const context = useUserContext();
    if (!context) return <div>Loading ...</div>;

    const {authStatus} = context;

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
                <img className="h-14 w-14 justify-center" src="/images/default_profpic.png" alt="profile picture dropdown icon" />
                <p className="text-sm">My Profile</p>
            </div>
        </>
    )
}

export default ProfilePic;