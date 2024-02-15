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
            {/* <div className="flex p-4 items-center border-t-2 border-b-2 border-black font-semibold h-36 bg-[#CA384B] w-screen space-x-6">
                    <img src="images/stock_prof.png" className="w-16 h-16"/>
                    <h2 className="text-center text-3xl text-white ">{family.family_name}</h2>
            </div> */}
            <div className="flex justify-center items-center flex-col">
                <img src="/images/family_heartbox.png" width={150} alt={`Family ${family.id}`} />
                <p className="">{family.family_name}</p>
            </div>
        </Link>
    )
}