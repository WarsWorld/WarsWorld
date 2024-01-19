import type { ChangeEventHandler } from "react";

type Props = {
  text: string;
  className?: string;
  isError?: boolean;
  height?: string;
  errorMessage?: string;
  value?: string | number | readonly string[];
  id?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function TextAreaInput({
  text,
  id,
  value,
  isError,
  errorMessage,
  onChange,
  className,
  height,
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
        <textarea 
          className={`@mt-2 @w-full @text-black @p-4 @text-xl smallscreen:@text-2xl @border-4 @rounded-2xl ${
            isError == true ? "@border-orange-star" : "@border-primary"
          }`}
          style={{ height }}
          placeholder="Write here... "
          value={value}
          onChange={onChange}
        />
        {isError == true && errorMessage != "" && <p className="@text-orange-star">{errorMessage}</p>}
      </div>
    </>
  );
}