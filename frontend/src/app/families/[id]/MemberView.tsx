type MemberListProps =
{
    members?: Member[] | null;
    signedInUserId?:string;
}
type Member = {
    id: string;
    first_name: string;
    last_name: string;
  }
export default function MemberList({members = [],signedInUserId}:MemberListProps){
    const filteredMembers = members?.filter((member) => member.id !== signedInUserId);
    return(
        <div className="flex-col flex space-y-2">
            <h2 className="mx-auto text-3xl font-loves font-bold border-b-2 border-[#d31c60]">Members</h2>
            <div className="flex bg-[#f3d8e6] flex-col border-2 border-[#d31c60] rounded-xl overflow-auto max-h-[calc(40vh-80px)]">
                {members && members.map((member,index) => (
                    <div key={member.id} className="flex flex-col">
                        <div className="flex py-2 px-12">
                            <img 
                                src="/images/default_profpic.png"
                                width={40}
                                className="justify-center items-center"
                            />
                            <p className="flex justify-center items-center ">
                                {member?.first_name} {member?.last_name}
                            </p>
                        </div>
                        {index !== members.length - 1 && <div className="h-[1px] w-full mx-0  bg-[#a15e78]" />}
                    </div>
                    
                    
                ))}
            </div>
        </div>
    )
}