import type { ChangeEventHandler } from "react";

type Props = {
  text: string;
  className?: string;
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
  className,
}: Props) {
  return (
    <>
      <div className={className}>
        <label
          htmlFor={id ?? ""}
          className={`@text-xl smallscreen:@text-2xl ${
            isError == true ? "@text-orange-star" : "@text-white"
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
          className={`@text-black @border-[2.5px] @text-xl smallscreen:@text-2xl @w-full @h-[80%] @p-3 @mt-2 @rounded-xl ${
            isError == true ? "@border-orange-star" : "@border-primary"
          }`}
        />
        {isError == true && errorMessage != "" && <p className="@text-orange-star @pt-2">{errorMessage}</p>}
      </div>
    </>
  );
}
