"use client";
import { useEffect, useState } from "react";
import Card from "./card";
import toast from "react-hot-toast";
import { Family } from "../types";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

async function getData() {
  try {
    const res = await fetch("http://localhost:8000/api/user/families", {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 403) {
      // Handle 403 Forbidden response
      toast.error("Access denied", {
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
  const [currentPage, setCurrentPage] = useState(1);
  const familiesPerPage = 9;
  const [direction, setDirection] = useState<"left" | "right">("right"); // Track direction

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

  // Calculate the index of the first and last family to display
  const indexOfLastFamily = currentPage * familiesPerPage;
  const indexOfFirstFamily = indexOfLastFamily - familiesPerPage;
  const currentFamilies =
    data?.slice(indexOfFirstFamily, indexOfLastFamily) || [];

  // Calculate total pages
  const totalPages = Math.ceil((data?.length || 0) / familiesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setDirection("right"); // Set direction to right
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setDirection("left"); // Set direction to left
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:mx-40 gap-y-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="flex justify-center items-center flex-col"
          >
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
        transition={{ duration: 0 }}
      >
        No families found. Create one to get started!
      </motion.div>
    );
  }

  // Create an array of placeholders to ensure 9 spaces are always shown
  const placeholders = Array.from({ length: familiesPerPage }, (_, index) => (
    <div
      key={index}
      className="flex justify-center items-center flex-col mx-2 my-2"
      style={{ height: "110px" }}
    >
      {currentFamilies[index] ? (
        <Card
          key={currentFamilies[index].id}
          family={currentFamilies[index]}
          index={0}
        />
      ) : (
        <div className="w-[100px] h-[100px] bg-gray-200 rounded-lg" /> // Placeholder for empty space
      )}
    </div>
  ));

  return (
    <div>
      <motion.div
        key={currentPage}
        className="grid grid-cols-3 md:mx-40 gap-y-4"
        initial={{ x: direction === "right" ? 100 : -100 }}
        animate={{ x: 0 }}
        exit={{ x: direction === "right" ? -100 : 100 }}
        transition={{ duration: 0.4 }}
      >
        {placeholders}
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-2 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 flex items-center"
        >
          <FaChevronLeft />
        </button>

        {/* Page Indicators */}
        <div className="flex space-x-2 mx-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 ${
                currentPage === index + 1
                  ? "bg-blue-500 border-blue-500"
                  : "bg-transparent border-blue-500"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-2 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 flex items-center"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
