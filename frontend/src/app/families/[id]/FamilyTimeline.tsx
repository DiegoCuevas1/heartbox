
type FamilyTimelineProps =
{
    id:string | undefined;
}

export default function FamilyTimeline({id}:FamilyTimelineProps){
    return(
        <div className="flex-col flex">
           <div className="grid grid-cols-3 gap-2">
                <div className="flex mt-8">
                    <button>Add Relic</button>
                </div>
                <div className="flex h-10">
                    <h2 className="mx-auto text-3xl border-b-2 border-[#d31c60] font-loves font-bold">POSTS</h2>
                </div>
                <button className="flex justify-end mr-2 mt-8">Filters</button>
            </div>
            <div className="flex">

            </div>
        </div>
    )
}