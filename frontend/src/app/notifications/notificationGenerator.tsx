'use client'
import { useState,useEffect } from "react";
import { NotificationType } from "../types/notification";
import Notification from "./notification";



async function getData() {
    try {
      const res = await fetch(`http://localhost:8000/api/user/notifications`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!res.ok) {
        // Handle error cases
        throw Error("You are not a member of this family")
      }
  
      const data = await res.json();
      // Process the data as needed
      return data; // Add this line to return the data from the function
    } catch (error:any) {
      return error; // Rethrow the error to be caught by the calling code
    }
  }
export default function NotificationGenerator()
{
    const [notifications,setNotifications] = useState<NotificationType[]>();
   
    useEffect(()=>
    {
        async function fetchData() {
            try {
              const fetchedData = await getData();
              // Process data or set it to state as needed
              setNotifications(fetchedData);
            } catch (error: any) {
              console.error('Error in fetchData:', error.message);
            }
          };
        fetchData();
    },[])

    // const notification = {
    //     id:1,
    //     content:'joined the Cuevas heartbox',
    //     notification_type:'joined_family',
    //     user_details:{
    //         id:1,
    //         first_name:'Diego',
    //         last_name:'Cuevas',
    //         profile_picture:'default_profpic.png'
    //     }
    // }
    return(
        <>
            <div className="flex-col space-y-4">
                {notifications && Array.isArray(notifications) && notifications.map((notification,index)=>
                {
                    return(
                        <Notification key={index} notification={notification} />
                    )
                })}
                
            </div>
            {notifications && notifications.length === 0 && 
                <div className="flex justify-center text-links text-xl font-loves font-bold">
                    No Notifications yet...
                </div>}
            {!notifications && 
            <div className="flex justify-center text-links text-xl font-loves font-bold">
                No Notifications yet...
            </div>}
            {/* <Notification notification={notification}/> */}
        </>
    )
}