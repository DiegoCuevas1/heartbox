import Link from "next/link";

type FamilyProps = 
{
    id:string,
    family_name:string,
}

export default function Card({family}:{family:FamilyProps})
{
    return(
        <Link href={`/families/${family.id}`}>
            <div className="flex justify-center items-center flex-col hover:scale-125 transition-all">
                <img src="/images/family_heartbox.png" width={150} alt={`Family ${family.id}`} />
                <p className="text-[#0c0c0c]">{family.family_name}</p>
            </div>
        </Link>
    )
}