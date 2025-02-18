"use client";

import { useState } from "react";
import { BiSearch } from "react-icons/bi";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholder, setPlaceholder] = useState("Search...");
  const [isFocused, setIsFocused] = useState(false);

  const getWidthClass = (input: string) => {
    const maxWidth = 192;
    const charWidth = 8;
    const calculatedWidth = input.length * charWidth;

    if (isFocused || calculatedWidth >= maxWidth) {
      return "w-80";
    } else return "w-48";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        onFocus={() => {
          setIsFocused(true);
          setPlaceholder("Search for Relics, Heartboxes, People");
        }}
        onBlur={() => {
          setIsFocused(false);
          setPlaceholder("Search...");
        }}
        className={`p-2 border transition-all duration-150 focus:w-80 group border-gray-300 rounded-l-md ${getWidthClass(searchTerm)}`}
      />
      <button
        type="submit"
        className={`flex items-center justify-center p-2 border-gray-300 active:border-black border rounded-r-md transition-transform duration-150 active:scale-90`} // Scale effect
        onSubmit={handleSearch}
      >
        <BiSearch className="text-gray-900 text-3xl" />
      </button>
    </form>
  );
};

export default SearchBar;
