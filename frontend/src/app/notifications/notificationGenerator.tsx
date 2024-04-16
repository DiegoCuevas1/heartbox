import Notification from "./notification"
export default function NotificationGenerator()
{
    const notification = {
        id:1,
        content:'joined the Cuevas heartbox',
        notification_type:'joined_family',
        user_details:{
            id:1,
            first_name:'Diego',
            last_name:'Cuevas',
            profile_picture:'default_profpic.png'
        }
    }
    return(
        <>
            <Notification notification={notification}/>
        </>
    )
}