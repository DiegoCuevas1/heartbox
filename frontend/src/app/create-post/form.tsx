'use client';

import { FormEvent, useContext, useEffect, useState } from "react";
import { Family} from "../types";
import Image from "next/image";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/AuthContext";
import router from "next/router";
import sanitize_res_msg from "@/utils/utilFunctions";
import { useRouter } from "next/navigation";

async function getData() {
    try {
      const res = await fetch(`http://localhost:8000/api/user/families`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!res.ok) {
        // Handle error cases
        console.log('Failed Fetch');
        return Error()
      }
      
      const data = await res.json();
      // Process the data as needed
      return data; // Add this line to return the data from the function
    } catch (error:any) {
      console.error('Error:', error.message);
      throw error; // Rethrow the error to be caught by the calling code
    }
  }



export default function FormComponent()
{
    const user = useUserContext()
    const router = useRouter();
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        
        if(selectedFamily?.id===-1)
        {
            toast.error('Select a Family!')
            return;
        }

        const formData = new FormData(e.currentTarget);
        
        const data = {
            familyId: selectedFamily?.id,
            title: formData.get('title'),
            description: formData.get('description'),
        }
        const res = await fetch('http://localhost:8000/api/user/posts',{
            headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify(data),
              credentials: "include",
        })
        const res_msg = await res.text(); 
            if (res.ok) {
                toast.success(sanitize_res_msg(res_msg));
                router.push(`/families/${selectedFamily?.id}`);
              } else toast.error(res_msg);
        
    }
    const [familyModal,setFamilyModal] = useState(false)
    const [selectedFamily,setSelectedFamily] = useState<Family | null>(
        {
            id: -1,
            family_name: '',
            family_description: '',
            invite_code: '',
            members: [],
        }
    );
    const [families, setFamilies] = useState<Family[]>([])
    const toggleFamilyModal = () =>
    {
        setFamilyModal((prev)=>!prev)
    }  
    useEffect(()=>{
        async function fetchData() {
            try {
              const fetchedData = await getData();
              // Process data or set it to state as needed
              setFamilies(fetchedData);
            } catch (error: any) {
              console.error('Error in fetchData:', error.message);
            }
          };
          fetchData();
        }
    ,[])
    const selectFamily = (index:number) => {
        setSelectedFamily(families[index]);
        setFamilyModal(false); // Close the modal upon selecting a family
      };
    return(
        
        <div className="flex-col flex">
            <form className="flex-col flex space-y-1" onSubmit={handleSubmit}>
                <div className="flex space-y-2 flex-col">
                    <label className="w-10 font-loves font-bold border-b-2 border-[#d31c60]">Title</label>
                    <input 
                        className="border-[#d31c60] font-loves font-bold italic rounded-md px-2 border-2"
                        type="text"
                        name="title"
                        placeholder="Enter Post Title..."
                    />
                </div>
                <div className="flex space-y-2 flex-col">
                    <label className="w-24 font-loves font-bold border-b-2 border-[#d31c60]">Description</label>
                    <textarea
                        className="border-[#d31c60] font-loves font-bold italic rounded-md px-2 border-2"
                        rows={5}
                        name="description"
                        placeholder="Enter Post Description..."
                    />
                </div>
                <div className="flex mx-auto space-x-4">
                    <div className="flex-col flex space-y-2">
                        <div onClick={toggleFamilyModal} className="flex mx-auto bg-white py-4 px-5 border-2 border-[#d31c60] rounded-xl">
                            {selectedFamily?.family_name=== '' ? <p className="text-white text-xl items-center justify-center text-center pb-1 px-[9px] bg-[#d31c60] rounded-full">+</p> : <Image src={"/images/families.png"} width={35} height={50} alt={""}></Image>}
                        </div>
                        <div className="flex">
                            <p className="flex bg-white border-2 border-[#d31c60] px-2 rounded-lg font-loves font-bold">
                                {selectedFamily?.family_name === '' ? 'Select Family' : selectedFamily?.family_name}
                            </p>
                            {/* <select className="border-[#d31c60] font-loves font-bold italic rounded-md px-2 border-2">
                                <option value="" disabled selected hidden>Select Family</option>
                                <option value="family1">Family 1</option>
                                <option value="family2">Family 2</option>
                            </select> */}
                        </div>
                    </div>
                    
                    <div className="items-center justify-center">
                        <button className="bg-[#d31c60] mt-4 rounded-lg p-2 font-loves font-bold text-2xl text-white" type="submit">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
            {familyModal && (
                    <ul className="flex-col bg-white ml-4 w-60 mt-2 border-2 border-[#d31c60] ">
                        {families.map((family,index)=>
                        (
                            <div key={index} className="flex-col justify-center flex hover:bg-[#f3d8e6] active:bg-[#f3d8e6]">
                                <div onClick={()=>selectFamily(index)} className="flex  py-2  px-1 hover:cursor-pointer space-x-3">
                                    <Image 
                                        alt="hello"
                                        src="/images/families.png"
                                        width={40}
                                        height={40}
                                    />
                                    <p className="mt-2 text-center hover:underline">{family.family_name}</p>
                                </div>
                                

                                {index !== families.length - 1 && <div className="h-[2px] w-full bg-black" />}
                            </div>
                            ))}
                    </ul>
            )}

        </div>
    )
}