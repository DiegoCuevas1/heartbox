import FormComponent from "./form";

export default function Page() {
    return(
        <div className="flex-col flex bg-[#fde9f1] h-screen p-4">
            <h2 className="mx-auto text-3xl font-loves font-bold border-b-4 border-[#d31c60]">Create Post</h2>
            <FormComponent /> 
        </div>
    )
}