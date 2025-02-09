import Image from "next/image";
import Link from "next/link";
import { Family } from "../types";
import { motion } from "framer-motion";

export default function Card({ family, index }: { family: Family; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.15 
      }}
    >
      <Link href={`/families/${family.id}`}>
        <div className="flex justify-center items-center flex-col hover:scale-125 transition-all">
          <Image
            src={`https://res.cloudinary.com/dcyk5quni/${family.family_picture}`}
            width={100}
            height={100}
            alt={`Family ${family.id}`}
          />
          <p className="text-[#0c0c0c] text-center">{family.family_name}</p>
        </div>
      </Link>
    </motion.div>
  );
}
