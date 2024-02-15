'use client';
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import ProfilePic from "./profilePic";
import { useState } from "react";
import Logout from "../logoutbtn";
import { IconContext } from "react-icons";
const NavBar = () =>
{
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen,setIsProfileMenuOpen]=useState(false);
    const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    };
    const toggleProfileMenu = () => {
        setIsProfileMenuOpen((prev) => !prev);
        };
    
    return(
        <nav>
            {/* <div className={`flex bg-white items-center h-[120px] justify-center w-screen px-6 py-8 sm:px-10 space-x-24 md:space-x-60 lg:space-x-[34rem] `}>
                <div className="">
                    <button onClick={toggleProfileMenu}><ProfilePic /></button>
                    {isProfileMenuOpen && (
                    <div className="z-[1000] fixed border-r-2 border-b-2 border-black top-[120px] left-0 w-[190px] rounded-br-[25px] z-[1000] text-white h-[335px] flex bg-[#268874]">
                        <div className="flex mt-4 flex-col mx-auto justify-content items-center space-y-2">
                            <Link href={"/home"} onClick={toggleProfileMenu} className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">My Profile</Link>
                            <Link href="/about" onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Edit Profile</Link>
                            <Link href={"/families"} onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">My Families</Link>  
                            <Link href={"/"} onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Add a Family</Link>
                            <Link href={"/"} onClick={toggleProfileMenu}   className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Settings</Link>
                            <div onClick={toggleProfileMenu}><Logout /></div>
                        </div>
                    </div>)}
                </div>
                <div className="mx-4">
                    <Link href="/home" className="text-black"><img src="/images/heartbox_logo.png" height={25} width={80}/></Link>
                </div>
                <div className="block ">
                    <IconContext.Provider value={{ color: "#D31C5F" }}>
                        <button onClick={toggleMenu} className="hover:scale-y-150 transition-all">
                          <GiHamburgerMenu  />
                        </button>
                    </IconContext.Provider>
                    
                    {isMenuOpen && (
                    <div className="z-[1000] fixed top-[120px] right-0 w-[190px] z-[1000] text-white border-black border-l-2 border-b-2 rounded-bl-[25px] h-[200px] flex bg-[#268874]">
                        <div className="flex flex-col mx-auto justify-content items-center space-y-2 mt-4">
                            <Link href="/home" className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">Home</Link>
                            <Link href={"/home"}className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">About Us</Link>
                            <Link href={"/home"}className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">FAQ</Link>
                            
                           
                        </div>
                    </div>)}
                </div>
            </div> */}
            <div className="flex fixed z-[1000] w-screen px-8 justify-between items-center h-28 bg-gradient-to-l from-[#f4a7a7] via-[#f9c0c1] to-[#f4a7a7]">
                <div>
                    <button onClick={toggleProfileMenu}><ProfilePic /></button>
                    {isProfileMenuOpen && (
                    <div className="z-[1000] fixed border-r-2 border-b-2 border-black top-[112px] left-0 w-[190px] rounded-br-[25px] z-[1000] text-white h-[335px] flex bg-[#268874]">
                        <div className="flex mt-4 flex-col mx-auto justify-content items-center space-y-2">
                            <Link href={"/home"} onClick={toggleProfileMenu} className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">My Profile</Link>
                            <Link href="/about" onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Edit Profile</Link>
                            <Link href={"/families"} onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">My Families</Link>  
                            <Link href={"/"} onClick={toggleProfileMenu}  className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Add a Family</Link>
                            <Link href={"/"} onClick={toggleProfileMenu}   className="text-xl p-2 rounded-xl hover:bg-[#ff8989]">Settings</Link>
                            <div onClick={toggleProfileMenu}><Logout /></div>
                        </div>
                    </div>)}
                </div>
                <div className="flex items-center"> 
                    <Link href="/home" className="text-black">
                    <img src="/images/heartbox_logo.png" height={25} width={80} />
                    </Link>
                </div>

                <div className="flex items-center">
                    
                    <button onClick={toggleMenu} className="hover:scale-y-150 transition-all">
                        <img 
                            src="/images/3bars.png"
                            className="w-8 h-4 hover:scale-y-110"
                        />
                    </button>
                   
                    {isMenuOpen && (
                    <div className="z-[1000] fixed top-[112px] right-0 w-[190px] z-[1000] text-white border-black border-l-2 border-b-2 rounded-bl-[25px] h-[200px] flex bg-[#268874]">
                        <div className="flex flex-col mx-auto justify-content items-center space-y-2 mt-4">
                        <Link href="/home" onClick={toggleMenu} className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">
                            Home
                        </Link>
                        <Link href={"/home"} onClick={toggleMenu} className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">
                            About Us
                        </Link>
                        <Link href={"/home"} onClick={toggleMenu} className="text-xl p-2 hover:bg-[#ff8989] rounded-xl">
                            FAQ
                        </Link>
                        </div>
                    </div>
                    )}
                </div>
                </div>
        </nav>
    )
}

export default NavBar;