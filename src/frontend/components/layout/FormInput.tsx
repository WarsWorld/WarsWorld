import { ChangeEventHandler } from "react";

interface Props {
  text: string;
  id?: string;
  type?: string;
  onChange?: ChangeEventHandler;
}

export default function FormInput({ text, id, type, onChange }: Props) {
  return (
    <>
      <div className="@my-1">
        <label htmlFor={id ?? ""} className="@text-2xl">
          {text}
        </label>
        <input
          id={id ?? ""}
          name={id ?? ""}
          type={type ?? ""}
          content="Hello"
          onChange={onChange}
          className="@border-primary @border-2 @text-xl @w-full @p-2 @mt-2 @rounded"
        />
      </div>
    </>
  );
}
