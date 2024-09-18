'use client';
import { useEffect, useState } from "react";
import Card from "./card";
import toast from "react-hot-toast";
import { Family } from "../types";




async function getData() {
    try {
      const res = await fetch('http://localhost:8000/api/user/families', {
        method: "GET",
        credentials: "include",
      });
      
      if (res.status === 403) {
        // Handle 403 Forbidden response
        toast.error('',{
            style: {
              border: '1px solid #713200',
              padding: '6px 10px',
              backgroundColor: '#d31c60',
              color:'#FFFFFF'
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#d31c60',
            },
          })
      }
  
      if (!res.ok) {
        // Handle error cases
        console.log('Failed Fetch');
        return Error()
      }
  
      const data = await res.json();
      // Process the data as needed
      
      return data; // Add this line to return the data from the function
    } catch (error:any) {
      console.error('Error:', error.message);
      throw error; // Rethrow the error to be caught by the calling code
    }
  }
  
export default function CardGenerator() {
    const [data, setData] = useState<Family[] | null>(null);
    const fetchData = async () => {
        try {
          const fetchedData = await getData();
          // Process data or set it to state as needed
          setData(fetchedData)
        } catch (error:any) {
          console.error('Error in fetchData:', error.message);
        }
      };
    
      // Call fetchData when the component mounts
      useEffect(() => {
        fetchData();
      }, []);
      
      
    return(
        <div className="grid grid-cols-3 md:mx-40 gap-y-4">
          {Array.isArray(data) && data.map((family,index)=> {return <Card key={index} family={family} />})}
        </div>
    )
}