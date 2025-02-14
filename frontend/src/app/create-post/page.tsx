import FormComponent from "./form";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex-col flex h-screen">
      <h2 className="mx-auto text-3xl font-bold border-b-4 border-links">
        Create Post
      </h2>
      <Suspense fallback={<div>Loading...</div>}>
        <FormComponent />
      </Suspense>
    </div>
  );
}
