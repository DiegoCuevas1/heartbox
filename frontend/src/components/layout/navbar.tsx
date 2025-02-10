import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

const NavBar = () => {
  return (
    <nav className="bg-[#c9cfe9] w-full fixed top-0 z-50">
      <div className="flex p-4 items-center justify-between max-w-screen-xl mx-auto">
        <Link href={"/timeline"}>
          <Image
            src={"/images/icon-blue.png"}
            alt="Logo"
            width={75}
            height={50}
          />
        </Link>
        <div className="flex items-center">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
