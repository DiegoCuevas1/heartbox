'use client';
import Image from "next/image"
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaArrowAltCircleRight, FaQuestionCircle } from "react-icons/fa";

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const accordionData = [
        {
            title: 'What is a heartbox?',
            content: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis sapiente
                laborum cupiditate possimus labore, hic temporibus velit dicta earum
                suscipit commodi eum enim atque at? Et perspiciatis dolore iure
                voluptatem.`
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
                <div key={index} className={`flex-col ${index % 2 == 1 && 'bg-[#F9BAD3]'}`} >
                    <div className="flex pt-4 pb-2 space-x-2 items-center mt-2 ml-4 font-bold font-loves" onClick={() => toggleAccordion(index)}> 
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `` }}>
                            <FaQuestionCircle />
                        </IconContext.Provider>
                        <p className="flex w-60 text-xl">{item.title}</p>
                        <IconContext.Provider value={{ color: "#D31c60", size: '1.5em', className: `transition-all ${activeIndex === index ? 'rotate-90' : ''}` }}>
                            <FaArrowAltCircleRight />
                        </IconContext.Provider>
                    </div>
                    {activeIndex === index && (
                        <div className='accordion-content'>
                            {item.content}
                        </div>
                    )}
                    <hr className="h-[2px]  w-screen bg-[#d31c60]"/>
                </div>
            ))}
        </div>
    );
}
