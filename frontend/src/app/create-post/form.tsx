"use client";
import { apiFetch } from "@/utils/api";
import { RELIC_CATEGORIES } from "@/utils/categories";
import { compressImage } from "@/utils/compressImage";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

import { FormEvent, useContext, useEffect, useState } from "react";
import { Family } from "../types";
import Image from "next/image";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/AuthContext";

import { sanitize_res_msg } from "@/utils/utilFunctions";
import { useRouter, useSearchParams } from "next/navigation";

async function getData() {
  try {
    const res = await apiFetch(`/api/user/families`, {
      method: "GET",
    });

    if (!res.ok) {
      // Handle error cases
      console.log("Failed Fetch");
      return Error();
    }

    const data = await res.json();
    // Process the data as needed
    return data; // Add this line to return the data from the function
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error; // Rethrow the error to be caught by the calling code
  }
}

export default function FormComponent() {
  const user = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const original = e.target.files?.[0];
    if (!original) return;

    const type = original.type.startsWith("image/")
      ? "IMAGE"
      : original.type.startsWith("video/")
        ? "VIDEO"
        : null;
    if (!type) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    const file = type === "IMAGE" ? await compressImage(original) : original;
    const limitMb = type === "IMAGE" ? MAX_IMAGE_MB : MAX_VIDEO_MB;
    if (file.size > limitMb * 1024 * 1024) {
      toast.error(
        type === "IMAGE"
          ? `Photos must be under ${MAX_IMAGE_MB}MB`
          : `Videos must be under ${MAX_VIDEO_MB}MB (about a minute of video)`,
      );
      return;
    }

    setMediaType(type);
    setMediaFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedFamily?.id === -1) {
      toast.error("Pick a HeartBox for this relic!");
      return;
    }

    const formData = new FormData();
    formData.append("familyId", selectedFamily?.id.toString() || "");
    formData.append(
      "title",
      (e.currentTarget.querySelector('[name="title"]') as HTMLInputElement)
        ?.value || "",
    );
    formData.append(
      "description",
      (
        e.currentTarget.querySelector(
          '[name="description"]',
        ) as HTMLTextAreaElement
      )?.value || "",
    );
    formData.append("category", category);

    if (mediaFile && mediaType) {
      formData.append("media", mediaFile);
      formData.append("media_type", mediaType);
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/user/posts", {
        method: "POST",
        body: formData,
      });

      const res_msg = await res.text();
      if (res.ok) {
        toast.success(sanitize_res_msg(res_msg));
        router.push(`/families/${selectedFamily?.id}`);
      } else toast.error(sanitize_res_msg(res_msg));
    } catch {
      toast.error(
        "Could not reach HeartBox. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const [familyModal, setFamilyModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>({
    id: -1,
    family_name: "",
    family_description: "",
    invite_code: "",
    members: [],
    family_picture: "",
  });
  const [families, setFamilies] = useState<Family[]>([]);
  const toggleFamilyModal = () => {
    setFamilyModal((prev) => !prev);
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedData = await getData();
        // Process data or set it to state as needed
        setFamilies(fetchedData);
        const familyId = searchParams.get("familyId");
        if (familyId) {
          const family = fetchedData.find(
            (f: { id: number }) => f.id === parseInt(familyId),
          );
          if (family) {
            setSelectedFamily(family); // Set the selected family based on the URL param
          }
        }
      } catch (error: any) {
        console.error("Error in fetchData:", error.message);
      }
    }
    fetchData();
  }, [searchParams]);
  const selectFamily = (index: number) => {
    setSelectedFamily(families[index]);
    setFamilyModal(false); // Close the modal upon selecting a family
  };
  return (
    <div className="flex-col flex">
      <form className="flex-col flex space-y-1" onSubmit={handleSubmit}>
        <div className="flex space-y-2 flex-col">
          <label className="w-10 font-bold border-b-2 border-[#d31c60]">
            Title
          </label>
          <input
            className="border-[#d31c60]  font-bold italic rounded-md px-2 border-2"
            type="text"
            name="title"
            placeholder="Name this relic..."
          />
        </div>
        <div className="flex space-y-2 flex-col">
          <label className="w-24  font-bold border-b-2 border-[#d31c60]">
            Description
          </label>
          <textarea
            className="border-[#d31c60] font-bold italic rounded-md px-2 border-2"
            rows={5}
            name="description"
            placeholder="Tell the story behind it..."
          />
        </div>
        <div className="flex space-y-2 flex-col">
          <label className="w-24  font-bold border-b-2 border-[#d31c60]">
            Category
          </label>
          <select
            className="border-[#d31c60]  font-bold italic rounded-md px-2 border-2"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {RELIC_CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-y-2 flex-col">
          <label className="w-24 font-bold border-b-2 border-[#d31c60]">
            Media
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="border-[#d31c60] font-bold italic rounded-md px-2 border-2"
          />
          {mediaPreview && (
            <div className="mt-2">
              {mediaType === "IMAGE" ? (
                <Image
                  src={mediaPreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              ) : (
                <video src={mediaPreview} controls className="max-w-[200px]" />
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaPreview(null);
                  setMediaFile(null);
                  setMediaType(null);
                }}
                className="mt-2 text-[#d31c60]"
              >
                Remove media
              </button>
            </div>
          )}
        </div>
        <div className="flex mx-auto space-x-4">
          <div className="flex-col flex space-y-2">
            <div
              onClick={toggleFamilyModal}
              className="flex mx-auto bg-white py-4 px-5 border-2 border-[#d31c60] rounded-xl"
            >
              {selectedFamily?.family_name === "" ? (
                <p className="text-white text-xl items-center justify-center text-center pb-1 px-[9px] bg-[#d31c60] rounded-full">
                  +
                </p>
              ) : (
                <Image
                  src="/images/default_profpic.png"
                  width={35}
                  height={50}
                  alt={""}
                ></Image>
              )}
            </div>
            <div className="flex justify-center">
              <p className="flex bg-white border-2 border-[#d31c60] px-2 rounded-lg font-loves font-bold">
                {selectedFamily?.family_name === ""
                  ? "Select Family"
                  : selectedFamily?.family_name}
              </p>
            </div>
          </div>

          <div className="items-center justify-center">
            <button
              className="bg-[#d31c60] mt-4 rounded-lg p-2 font-loves font-bold text-2xl text-white disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
      {familyModal && (
        <ul className="flex-col bg-white ml-4 w-60 mt-2 border-2 border-[#d31c60] ">
          {families.map((family, index) => (
            <div
              key={index}
              className="flex-col justify-center flex hover:bg-[#f3d8e6] active:bg-[#f3d8e6]"
            >
              <div
                onClick={() => selectFamily(index)}
                className="flex  py-2  px-1 hover:cursor-pointer space-x-3"
              >
                <Image
                  alt={`${family.family_name}'s family picture`}
                  src={`/images/default_profpic.png`}
                  width={40}
                  height={40}
                />
                <p className="mt-2 text-center hover:underline">
                  {family.family_name}
                </p>
              </div>

              {index !== families.length - 1 && (
                <div className="h-[2px] w-full bg-black" />
              )}
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}
