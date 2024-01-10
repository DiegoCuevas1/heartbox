
import Link from "next/link";
import FormComponent from "./form";

export default function Login() {
  return (
    <div className="border-2 justify-center rounded-[25px] px-6 py-8 border-primary relative bg-neutral shadow-lg mx-auto sm:w-11/12 md:w-10/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12 my-4">
      <h1 className="text-center text-2xl font-semibold">Welcome to Heart Box</h1>
      <div className="py-3">
        <FormComponent />
      </div>
      <p className="flex text-center flex-col m:flex-row justify-center">
        Need an Account?
        <span className="font-bold">
          <Link href={"/auth/sign-up"}>Sign Up</Link>
        </span>
      </p>
    </div>


  );
}