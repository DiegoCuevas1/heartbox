'use client';
import Image from "next/image"
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaArrowAltCircleRight, FaQuestionCircle } from "react-icons/fa";
import { PiArrowElbowDownRightLight } from "react-icons/pi";

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const accordionData = [
        {
            title: 'What is a ____?',
            content: `A ____ is a digital storage for your safekeeping of videos, images, recipes, notes, and much more!`
        },
        {
            title: 'What is required to use a heartbox?',
            content: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia veniam
                reprehenderit nam assumenda voluptatem ut. Ipsum eius dicta, officiis
                quaerat iure quos dolorum accusantium ducimus in illum vero commodi
                pariatur? Impedit autem esse nostrum quasi, fugiat a aut error cumque
                quidem maiores doloremque est numquam praesentium eos voluptatem amet!
                Repudiandae, mollitia id reprehenderit a ab odit!`
        },
        {
            title: 'What is a Relic?',
            content: `Sapiente expedita hic obcaecati, laboriosam similique omnis architecto ducimus magnam accusantium corrupti
                quam sint dolore pariatur perspiciatis, necessitatibus rem vel dignissimos
                dolor ut sequi minus iste? Quas?`
        },
        {
            title: 'How do I join a family?',
            content: `Sapiente expedita hic obcaecati, laboriosam similique omnis architecto ducimus magnam accusantium corrupti
                quam sint dolore pariatur perspiciatis, necessitatibus rem vel dignissimos
                dolor ut sequi minus iste? Quas?`
        },

    ];

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="flex-col flex">
            <h2 className="text-xl text-center w-90 mt-4 mx-auto border-b-4 font-loves font-bold border-[#d31c60]">Frequently Asked Questions</h2>
            {accordionData.map((item, index) => (
                <div key={index} className={`flex-col `} >
                    <div className="flex pt-4 pb-2 space-x-2 items-center mt-2 ml-8 font-bold font-loves" onClick={() => toggleAccordion(index)}> 
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `` }}>
                            <FaQuestionCircle />
                        </IconContext.Provider>
                        <p className="flex w-60 text-xl">{item.title}</p>
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `transition-all ${activeIndex === index ? 'rotate-90' : ''}` }}>
                            <FaArrowAltCircleRight />
                        </IconContext.Provider>
                    </div>
                    {activeIndex === index && (
                        <div className='flex items-center'>

                            <IconContext.Provider value={{ className: "shared-class ml-9",size:'40'}}>
                                <PiArrowElbowDownRightLight />
                            </IconContext.Provider>
                            <p className="flex w-96 font-extrabold text-center font-loves text-lg">{item.content}</p>
                        </div>
                    )}
                    <hr className="h-[2px]  w-screen bg-[#d31c60] mt-2"/>
                </div>
            ))}
        </div>
    );
}
