'use client';
import Link from "next/link";
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import FormComponent from "./form";


export default function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        inviteCode: ""
      });

    const [formCreateData,setFormCreateData]=useState({
      family_name:"",
      family_description:"",  
    })
    

    const handleInputChange = (e: any) => {
        const { name, value, type } = e.target;

        // Assign the value to newValue
        let newValue = value;

        setFormData({ ...formData, [name]: newValue });
    };  
    const handleCreateInputChange = (e:any)=>
    {
        const {name,value,type} = e.target;
        let newValue = value;
        setFormCreateData({...formCreateData,[name]:newValue})
    }
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            inviteCode: formData.get('inviteCode')
        };
        try {
            const res = await fetch("http://localhost:8000/api/user/families/join-family", {
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
    const handleCreateFamily = async (e:FormEvent<HTMLFormElement>) =>
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
    return (
        <div className="flex-col h-screen bg-[#fde9f1]">
            {/* <Link href={"/families"}>
                <p className="p-8">{`<`} Back to Families</p>
            </Link>
            <h2 className="justify-center items-center text-4xl mb-5 text-[#Ca384b] text-center flex">Add a Family</h2>
            <div className="flex w-96 mx-auto bg-[#e59ca5]">
                <form onSubmit={handleSubmit} className="p-20">
                    <label>Family Invite Code*:</label>
                    <input 
                        type="text"
                        placeholder="Invite Code"
                        name="inviteCode"
                        onChange={handleInputChange}
                        value={formData.inviteCode}
                    />
                    <button type="submit" className="">
                        Submit
                    </button>
                </form>
            </div>
            <div className="flex w-96 mx-auto bg-[#e59ca5]">
                <form onSubmit={handleCreateFamily} className="p-20">
                    <label>Family Name:</label>
                    <input 
                        type="text"
                        placeholder="Family Name"
                        name="family_name"
                        onChange={handleCreateInputChange}
                        value={formCreateData.family_name}
                    />
                    <label>Family Description:</label>
                    <input 
                        type="text"
                        placeholder="Family Description"
                        name="family_description"
                        onChange={handleCreateInputChange}
                        value={formCreateData.family_description}
                    />
                    <button type="submit" className="">
                        Submit
                    </button>
                </form>
            </div> */}

            
            <h2 className="pt-12 flex text-[#0c0c0c] font-loves font-bold text-3xl justify-center items-center text-center">
                <span className="border-b-2 border-[#D31c60]">Create or Join a Family</span>
            </h2>

            <FormComponent />

            <div className="flex justify-center items-center flex-col mt-7">
                <p className="text-[#2a292a]">Have a Question?</p>
                <p className="text-[#2a292a]"> Go to our <Link href={"/home"} className="text-[#d31c60] font-bold">FAQ page</Link></p>
            </div>
        </div>
    )
  }