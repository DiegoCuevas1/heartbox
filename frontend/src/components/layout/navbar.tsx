import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { FaBell } from "react-icons/fa";

const NavBar = () => {
  return (
    <nav className="w-full fixed top-0 z-50">
      <div className="flex p-4 items-center justify-between max-w-screen-xl mx-auto">
        <Link href={"/timeline"} className="flex items-center space-x-3">
          <Image
            src={"/images/icon-blue.png"}
            alt="Logo"
            width={75}
            height={50}
          />
          <h1 className="text-2xl font-semibold text-gray-900">Heartbox</h1>
        </Link>
        <div className="flex items-center space-x-4">
          <SearchBar />
          <FaBell className="text-2xl" />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
