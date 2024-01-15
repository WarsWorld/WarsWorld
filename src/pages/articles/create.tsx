import Select from "frontend/components/layout/Select";
import FormInput from "frontend/components/layout/forms/FormInput";
import Head from "next/head";
import type { SelectOption } from "frontend/components/layout/Select";
import { useState } from "react";

const CATEGORIES = [
  { label: "Patch", value: 0 },
  { label: "Events", value: 1 },
  { label: "Maintenance", value: 2 },
  { label: "Basics", value: 3 },
  { label: "Advance", value: 4 },
];

export default function Create() {
  const [category, setCategory] = useState<SelectOption | undefined>({ label: "Patch", value: 0 });

  return (
    <>
      <Head>
        <title>Create Artcile | Wars World</title>
      </Head>

      <div className="@w-[90%]">
        <FormInput className="@my-4" text="Title" />
        <FormInput className="@my-4" text="Description" />
        <Select className="@my-4" options={CATEGORIES} value={category} onChange={(o) => setCategory(o)}/>
        <textarea className="@my-4 @w-full @h-24" placeholder="Write here... " />
      </div>

      <div className="preview">
        <div>Article</div>
      </div>
    </>
  )
}