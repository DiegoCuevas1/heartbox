'use-client'
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";


export default function FormComponent()
{
    const [formType, setFormType] = useState(false); // false for "create", true for "join"



    return(
        <div className="mt-4 mx-auto flex w-80 shadow-xl block border-2 border-[#d31c60] flex-col rounded-lg">
                <div className="flex border-b-2 border-[#d31c60]">
                    <p
                        className={classNames('py-2 px-[51px] font-loves font-bold flex  text-xl', {
                        'bg-[#D31c60] text-white': formType === false, // Highlight "Create" when formType is false
                        })}
                        onClick={() => setFormType(false)}
                    >
                        Create
                    </p>
                    <p
                        className={classNames('py-2 font-loves font-bold flex px-[51px] text-xl', {
                        'bg-[#D31c60] text-white': formType === true, // Highlight "Join" when formType is true
                        })}
                        onClick={() => setFormType(true)}
                    >
                        Join
                    </p>
                </div>
                {!formType && <CreateForm />}
                {formType && <JoinForm />}
        </div>
    )
}


    
function CreateForm() 
{
    const router = useRouter()
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            family_name: formData.get('family_name'),
            family_description:formData.get('family_description')
        };
        try {
            const res = await fetch("http://localhost:8000/api/user/families", {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
                credentials: "include",
              });
            const res_msg = await res.text(); 
            if (res.ok) {
                toast.success(res_msg);
                
                router.push("/families");
              } else toast.error(res_msg);
            } catch (error) {
              toast.error((error as Error).toString());
        }

    }
    
    return(
        <div className="flex p-8">
            <form className="grid grid-cols-1 space-y-1" onSubmit={handleSubmit}>
                <label className="font-loves font-bold">Family Name<span className="text-[#ff0000]">*</span>:</label>
                <input 
                    type="text"
                    placeholder="Family Name"
                    className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
                    required
                />
                <label className="font-loves font-bold">Family Description:</label>
                <textarea
                    placeholder="Family Description"
                    className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
                />
                <div className="h-2"></div>
                <button className="drop-shadow-lg bg-[#D31c60] rounded w-36 p-2 mx-auto font-loves font-bold text-white hover:scale-125 transition-all active:scale-95">Create Family</button>
            </form>
        </div>
    )
}

function JoinForm() 
{
    const router = useRouter()
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            family_name: formData.get('family_name'),
            family_description:formData.get('family_description')
        };
        try {
            const res = await fetch("http://localhost:8000/api/user/families", {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
                credentials: "include",
              });
            const res_msg = await res.text(); 
            if (res.ok) {
                toast.success(res_msg);
                
                router.push("/families");
              } else toast.error(res_msg);
            } catch (error) {
              toast.error((error as Error).toString());
        }

    }
    return(
        <div className="flex p-8">
           <form className="grid grid-cols-1 space-y-1" onSubmit={handleSubmit}>
                <label className="font-loves font-bold">Family Invite Code<span className="text-[#ff0000]">*</span>:</label>
                <input 
                    type="text"
                    placeholder="Family Name"
                    className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
                    required
                />
                <div className="h-2"></div>
                <button className="drop-shadow-lg bg-[#D31c60] rounded w-36 p-2 mx-auto font-loves font-bold text-white hover:scale-125 transition-all active:scale-95">Add Family</button>
            </form>
        </div>
    )
}