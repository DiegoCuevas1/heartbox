'use client';
import Button from "@/components/button";
import Logout from "@/components/logoutbtn";
import Link from "next/link";
import { useEffect, useState } from "react";

type CardProps = {
  title: string;
  description: string;
  image: string;
};

function Card({ cardProps }: { cardProps: CardProps }) {
  const { title, description, image } = cardProps;

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <img src={`images/${image}`} alt={title} style={{ height: '200px', width: '300px' }} />
      {/* Add other card content based on cardProps */}
    </div>
  );
}

export default function SignInSignUp() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const nextCard = () => {
    setActiveCardIndex((prevIndex) => (prevIndex + 1) % cardData.length);
  };

  const prevCard = () => {
    setActiveCardIndex((prevIndex) => (prevIndex - 1 + cardData.length) % cardData.length);
  };

  const cardData = [
    {
      title: "Card 1",
      description: "Description for Card 1",
      image: "stock_family.jpg",
    },
    {
      title: "Card 2",
      description: "Description for Card 2",
      image: "chicken_man.webp",
    },
    {
      title: "Card 3",
      description: "Description for Card 3",
      image: "cat_caviar.jpg",
    },
  ];

  const activeCard = cardData[activeCardIndex];

  useEffect(() => {
    // Set up automatic transition every 5 seconds
    const intervalId = setInterval(() => {
      nextCard();
    }, 5000);

    // Clear the interval on component unmount to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [activeCardIndex]);
  
  return (
    <div className="flex flex-col mb-8 mt-4 ">
      <div id="more" className="flex flex-col">
        <h4 className="text-center text-[#CA384B] font-semibold text-3xl">Leave Your Mark Today</h4>
        <div className="flex w-full max-w-screen-xl items-center mx-auto justify-center">
          <div className="transition-all opacity-100 duration-500">
            <Card cardProps={activeCard} />
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <button className="border-2 border-[#CA384B] rounded-lg p-1 text-[#CA384B] font-bold hover:bg-[#CA384B] hover:text-white transition-all" onClick={prevCard}>&lt; Prev</button>
          <button className="border-2 border-[#CA384B] rounded-lg p-1 text-[#CA384B] font-bold hover:bg-[#CA384B] hover:text-white transition-all " onClick={nextCard}>Next &gt;</button>
        </div>
        <div className="mt-4 mx-auto z-[1] flex-col flex space-y-4">
          <Link href={"/auth/sign-up"}>
            <Button text="Sign Up" />
          </Link>
          <Link href={"/auth/sign-in"}>
            <Button text="Login" />
          </Link>
        </div>
      </div>
    </div>
  );
}
