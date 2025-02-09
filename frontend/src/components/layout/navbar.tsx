import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav>
      <div className="fixed top-0 w-full bg-[#c9cfe9] flex p-4">
        <Link href={"/timeline"}>
          <Image
            src={"/images/icon-blue.png"}
            alt={""}
            width={75}
            height={50}
          />
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
