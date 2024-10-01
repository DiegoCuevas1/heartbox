import Image from "next/image";
import Link from "next/link";
import { Family } from "../types";


export default function Card({family}:{family:Family})
{
    return(
        <Link href={`/families/${family.id}`}>
            <div className="flex justify-center items-center flex-col hover:scale-125 transition-all">
                <Image src="/images/families.png" width={100} height={100} alt={`Family ${family.id}`} />
                <p className="text-[#0c0c0c] text-center">{family.family_name}</p>
            </div>
        </Link>
    )
}