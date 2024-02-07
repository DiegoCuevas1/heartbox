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
            <img className="h-14" src="/images/default_profpic.png" alt="" />
        </>
    )
}

export default ProfilePic;