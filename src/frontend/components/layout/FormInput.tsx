import { ChangeEventHandler } from "react";

interface Props {
  text: string;
  isError?: boolean;
  errorMessage?: string;
  value?: string | number | readonly string[];
  id?: string;
  type?: string;
  onChange?: ChangeEventHandler;
}

export default function FormInput({
  text,
  id,
  type,
  value,
  isError,
  errorMessage,
  onChange,
}: Props) {
  return (
    <>
      <div className="@my-1">
        <label
          htmlFor={id ?? ""}
          className={`@text-2xl ${
            isError ? "@text-orange-star" : "@text-white"
          }`}
        >
          {text}
        </label>
        <input
          id={id ?? ""}
          name={id ?? ""}
          type={type ?? ""}
          content="Hello"
          onChange={onChange}
          value={value}
          className={`@text-black @border-[2.5px] @text-xl @w-full @p-3 @mt-2 @rounded-xl ${
            isError ? "@border-orange-star" : "@border-primary"
          }`}
        />
        {isError && <p className="@text-orange-star @pt-2">{errorMessage}</p>}
      </div>
    </>
  );
}
