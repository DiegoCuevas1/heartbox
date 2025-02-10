"use client";

import { useState } from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your search logic here
    console.log("Searching for:", searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="p-2 border focus:text-2xl transition-all duration-150 border-gray-300 rounded-l-md"
      />
      <button type="submit" className=" ">
        <BiSearch
          className="text-white bg-links text-5xl rounded-r-md p-2"
          width={50}
        />
      </button>
    </form>
  );
};

export default SearchBar;
