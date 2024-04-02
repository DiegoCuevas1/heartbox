
import Link from "next/link";
import CardGenerator from "./cardGenerator";

export default function Home() {
    

    return (
        <div className="flex flex-col h-screen pt-8 bg-[#fde9f1]">
            <h3 className="mx-auto mt-2 mb-6 text-4xl text-[#0c0c0c] border-[#D31C5F] font-loves font-bold border-b-4">Heartboxes</h3>
            <CardGenerator />
            <div className="flex justify-center">
                <Link href={"/families/add-family"}>
                    <button className="p-2 bg-[#D31C5F] w-36 text-xl font-loves font-bold text-white mt-7 rounded-lg shadow-[0_20px_10px_-15px_rgba(0,0,0,.3)] mx-auto hover:scale-125 active:scale-90 transition-all">
                        Add Family
                    </button>
                </Link>
            </div>
            
        
        </div>
    )
}