import type { ChangeEventHandler } from "react";

type Props = {
  text: string;
  name?: string;
  className?: string;
  isError?: boolean;
  height?: string;
  errorMessage?: string;
  value?: string | number | readonly string[];
  id?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  textAreaStyling?: string;
};

export default function TextAreaInput({
  text,
  name,
  id,
  value,
  isError,
  errorMessage,
  onChange,
  textAreaStyling,
  className,
  height,
}: Props) {
  return (
    <>
      <div className={className}>
        <label htmlFor={id ?? ""} className="@text-xl smallscreen:@text-2xl @text-white">
          {text}
        </label>
        <textarea
          className={`@mt-2 @w-full @text-white @p-4 @text-xl smallscreen:@text-2xl @border-[2.5px] @rounded-2xl @bg-black/50 ${
            isError == true ? "@border-orange-star" : "@border-primary"
          } ${textAreaStyling ?? ""}`}
          name={name}
          style={{ height }}
          placeholder="Write here... "
          value={value}
          onChange={onChange}
        />
        {isError == true && errorMessage != "" && (
          <p className="@text-white @bg-orange-star/80 @my-2 @px-2 @rounded-lg">{errorMessage}</p>
        )}
      </div>
    </>
  );
}
