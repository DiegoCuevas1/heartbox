"use client";

import { useState } from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholder, setPlaceholder] = useState("Search..."); // Default placeholder
  const [isClicked, setIsClicked] = useState(false); // State to track button click

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your search logic here
    console.log("Searching for:", searchTerm);
  };

  const handleButtonClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false); // Reset the click state after animation
    }, 300); // Duration of the animation
  };

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setPlaceholder("Search for Relics, Heartboxes, People")} // Change placeholder on focus
        onBlur={() => setPlaceholder("Search...")} // Reset placeholder on blur
        className="p-2 border w-48 focus:w-80 transition-all duration-150 border-gray-300 rounded-l-md"
      />
      <button
        type="submit"
        className={`flex items-center justify-center p-2 bg-links rounded-r-md transition-transform duration-150 ${isClicked ? "scale-90" : "scale-100"}`} // Scale effect
        onClick={handleButtonClick} // Handle button click
      >
        <BiSearch className="text-white text-3xl" /> {/* Adjusted size */}
      </button>
    </form>
  );
};

export default SearchBar;
