"use client";
import { sanitize_res_msg } from "@/utils/utilFunctions";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function FormComponent() {
  const [formTypeIsJoin, setFormTypeIsJoin] = useState(false); // false for "create", true for "join"

  return (
    <div className="mt-4 mx-auto flex w-80 shadow-xl border-2 border-[#d31c60] flex-col rounded-lg">
      <div className="flex border-b-2 border-[#d31c60]">
        <p
          className={classNames(
            "py-2 px-[51px] font-loves font-bold flex  text-xl hover:bg-[#D31c60] hover:text-white transition-all",
            {
              "bg-[#D31c60] text-white": formTypeIsJoin === false, // Highlight "Create" when formType is false
            }
          )}
          onClick={() => setFormTypeIsJoin(false)}
        >
          Create
        </p>
        <p
          className={classNames(
            "py-2 font-loves font-bold  flex px-[51px] text-xl hover:bg-[#D31c60] hover:text-white transition-all ",
            {
              "bg-[#D31c60] text-white": formTypeIsJoin === true, // Highlight "Join" when formType is true
            }
          )}
          onClick={() => setFormTypeIsJoin(true)}
        >
          Join
        </p>
      </div>
      {!formTypeIsJoin && <CreateForm />}
      {formTypeIsJoin && <JoinForm />}
    </div>
  );
}

function CreateForm() {
  const [formData, setFormData] = useState({
    family_name: "",
    family_description: "",
    family_picture: null,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    let newValue = value;

    setFormData({ ...formData, [name]: newValue });
  };
  const router = useRouter();
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      setFormData({ ...formData, family_picture: file }); // Update profilePic in formData state
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    data.append("family_name", formData.family_name);
    data.append("family_description", formData.family_description);
    if (formData.family_picture !== null) {
      data.append("family_picture", formData.family_picture); // Append profilePic only if it's not null
    }

    try {
      const res = await fetch("http://localhost:8000/api/user/families", {
        method: "POST",
        body: data,
        credentials: "include",
        // Set content type to multipart/form-data
        headers: {
          Accept: "application/json",
          //'Content-Type': 'multipart/form-data', // Don't set Content-Type manually
        },
      });
      const res_msg = await res.text();
      if (res.ok) {
        toast.success(sanitize_res_msg(res_msg));

        router.push("/families");
      } else toast.error(sanitize_res_msg(res_msg));
    } catch (error) {
      toast.error((error as Error).toString());
    }
  };

  return (
    <div className="flex p-8">
      <form className="grid grid-cols-1 space-y-1" onSubmit={handleSubmit}>
        <label className="font-loves font-bold">
          Family Name<span className="text-[#ff0000]">*</span>:
        </label>
        <input
          type="text"
          placeholder="Family Name"
          className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
          required
          id="family_name"
          name="family_name"
          onChange={handleInputChange}
        />
        <label className="font-loves font-bold">Family Description:</label>
        <textarea
          id="family_description"
          placeholder="Family Description"
          className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
          name="family_description"
          onChange={handleInputChange}
        />

        <label htmlFor="family_picture" className=" font-loves font-bold mb-1">
          Family Profile Picture:
        </label>
        <input
          id="family_picture"
          type="file"
          accept="image/*"
          name="family_picture"
          className=""
          onChange={handleFileChange}
        />
        <div className="h-2"></div>
        <button className="drop-shadow-lg bg-[#D31c60] rounded w-36 p-2 mx-auto font-loves font-bold text-white hover:scale-125 transition-all active:scale-95">
          Create Family
        </button>
      </form>
    </div>
  );
}

function JoinForm() {
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      inviteCode: formData.get("inviteCode"),
    };
    try {
      const res = await fetch(
        "http://localhost:8000/api/user/families/join-family",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      const res_msg = await res.text();
      if (res.ok) {
        toast.success(res_msg);

        router.push("/families");
      } else toast.error(res_msg);
    } catch (error) {
      toast.error((error as Error).toString());
    }
  };
  return (
    <div className="flex p-8">
      <form className="grid grid-cols-1 space-y-1" onSubmit={handleSubmit}>
        <label className="font-loves font-bold">
          Family Invite Code<span className="text-[#ff0000]">*</span>:
        </label>
        <input
          type="text"
          placeholder="Invite Code"
          className="border-2 border-[#c3366c] py-2 px-2 w-60 rounded-xl italic font-loves font-bold shadow-xl"
          required
          name="inviteCode"
        />
        <div className="h-2"></div>
        <button className="drop-shadow-lg bg-[#D31c60] rounded w-36 p-2 mx-auto font-loves font-bold text-white hover:scale-125 transition-all active:scale-95">
          Join Family
        </button>
      </form>
    </div>
  );
}
