"use client";
import { useState } from "react";

const FAQS = [
  {
    title: "What is a HeartBox?",
    content:
      "A HeartBox is a private space for your family (or a close group of friends) to keep and share memories. Only people you invite can see what's inside.",
  },
  {
    title: "What is a Relic?",
    content:
      "Anything you place in a HeartBox is a Relic: a photo, a video, a recipe, a story, a family tradition or a note about an heirloom. You can file relics under occasions like Christmas, Weddings or Birthdays so they're easy to find later.",
  },
  {
    title: "How do I join a family's HeartBox?",
    content:
      "Ask someone already in it for the invite code. It's shown on the HeartBox page and in its settings. Then go to Families, choose Join, and enter the code.",
  },
  {
    title: "How do I start a HeartBox for my family?",
    content:
      "Go to Families and create a new HeartBox. Give it a name and picture, then share the invite code with your relatives.",
  },
  {
    title: "Who can see my relics?",
    content:
      "Only members of the HeartBox you placed them in. Your timeline shows relics from every HeartBox you belong to, but people in one HeartBox never see relics from another one unless they're a member of both.",
  },
  {
    title: "Can I remove someone or change the invite code?",
    content:
      "Yes. The person who manages a HeartBox can edit its details, remove members and make a new invite code from HeartBox settings. Making a new code stops the old one from working.",
  },
  {
    title: "Can I edit or delete a relic?",
    content:
      "Open the relic and use Edit or Delete. You can change relics you added; the HeartBox manager can also delete relics in their HeartBox.",
  },
  {
    title: "Are there limits on uploads?",
    content:
      "Photos can be up to 10MB and are automatically resized to keep them quick to load. Videos can be up to 50MB, which is roughly a minute of phone video.",
  },
  {
    title: "I forgot my password.",
    content:
      'Choose "Forgot Password?" on the sign-in page and we\'ll email you a link to set a new one.',
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="flex-col flex max-w-2xl mx-auto px-4 py-4 text-black">
      <h2 className="text-2xl border-b-4 font-bold border-[#3f8fcb] mb-4">
        Frequently Asked Questions
      </h2>
      <ul className="flex flex-col divide-y">
        {FAQS.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <li key={faq.title}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setActiveIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center py-3 text-left font-bold text-lg"
              >
                {faq.title}
                <span aria-hidden className="text-[#d31c60] text-2xl">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && <p className="pb-4 text-gray-700">{faq.content}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
