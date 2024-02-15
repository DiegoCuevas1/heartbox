
import Link from "next/link";
import CardGenerator from "./cardGenerator";

export default function Home() {


    return (
        <div className="flex flex-col pt-8 bg-[#fde9f1] h-screen">
            <h3 className="mx-auto mt-2 mb-6 text-4xl border-[#D31C5F] font-loves font-bold border-b-4 ">My Families</h3>
            <CardGenerator />
            <div className="mx-auto space-y-2 mt-5">
                <p className="text-2xl underline text-[#ca384b] font-semibold">Add a new Family</p>
                
                <Link href={"/families/add-family"}>
                    <div className="flex justify-center">
                        <p className="text-[#ca384b] border-2 border-[#ca384b] px-4 py-2 text-center rounded-xl text-5xl">+</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}