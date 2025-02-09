"use client";
import { useEffect, useState } from "react";
import Card from "./card";
import toast from "react-hot-toast";
import { Family } from "../types";
import { motion } from "framer-motion";

async function getData() {
  try {
    const res = await fetch("http://localhost:8000/api/user/families", {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 403) {
      // Handle 403 Forbidden response
      toast.error("", {
        style: {
          border: "1px solid #713200",
          padding: "6px 10px",
          backgroundColor: "#d31c60",
          color: "#FFFFFF",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#d31c60",
        },
      });
    }

    if (!res.ok) {
      // Handle error cases
      console.log("Failed Fetch");
      return Error();
    }

    const data = await res.json();
    // Process the data as needed

    return data; // Add this line to return the data from the function
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error to be caught by the calling code
  }
}

export default function CardGenerator() {
  const [data, setData] = useState<Family[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const fetchedData = await getData();
      setData(fetchedData);
    } catch (error: any) {
      console.error("Error in fetchData:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:mx-40 gap-y-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="flex justify-center items-center flex-col">
            <div className="w-[100px] h-[100px] mx-2 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="text-center text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        No families found. Create one to get started!
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-3 md:mx-40 gap-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {Array.isArray(data) &&
        data.map((family, index) => {
          return <Card key={family.id} family={family} index={index} />;
        })}
    </motion.div>
  );
}
