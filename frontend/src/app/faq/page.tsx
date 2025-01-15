"use client";
import Image from "next/image";
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaArrowAltCircleRight, FaQuestionCircle } from "react-icons/fa";
import { PiArrowElbowDownRightLight } from "react-icons/pi";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const accordionData = [
    {
      title: "What is a ____?",
      content: `A ____ is a digital storage for your safekeeping of videos, images, recipes, notes, and much more!`,
    },
    {
      title: "What is required to use a heartbox?",
      content: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia veniam
                reprehenderit nam assumenda voluptatem ut. Ipsum eius dicta, officiis
                quaerat iure quos dolorum accusantium ducimus in illum vero commodi
                pariatur? Impedit autem esse nostrum quasi, fugiat a aut error cumque
                quidem maiores doloremque est numquam praesentium eos voluptatem amet!
                Repudiandae, mollitia id reprehenderit a ab odit!`,
    },
    {
      title: "What is a Relic?",
      content: `Sapiente expedita hic obcaecati, laboriosam similique omnis architecto ducimus magnam accusantium corrupti
                quam sint dolore pariatur perspiciatis, necessitatibus rem vel dignissimos
                dolor ut sequi minus iste? Quas?`,
    },
    {
      title: "How do I join a family?",
      content: `Sapiente expedita hic obcaecati, laboriosam similique omnis architecto ducimus magnam accusantium corrupti
                quam sint dolore pariatur perspiciatis, necessitatibus rem vel dignissimos
                dolor ut sequi minus iste? Quas?`,
    },
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="flex-col flex">
      <h2 className="text-2xl border-b-4 font-bold border-[#3f8fcb]">
        Frequently Asked Questions
      </h2>
    </div>
  );
}
