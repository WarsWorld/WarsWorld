import type { ChangeEventHandler } from "react";

type Props = {
  text?: string;
  className?: string;
  isError?: boolean;
  errorMessage?: string;
  value?: string | number | readonly string[];
  id?: string;
  type?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

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
        {text !== undefined && (
          <label htmlFor={id ?? ""} className="@text-xl smallscreen:@text-2xl @text-white">
            {text}
          </label>
        )}
        <input
          id={id ?? ""}
          name={id ?? ""}
          type={type ?? ""}
          onChange={onChange}
          value={value}
          className={`@text-white @border-[2.5px] @text-xl smallscreen:@text-2xl @w-full @p-3 @mt-2 @rounded-xl @bg-black/50 ${
            isError == true ? "@border-orange-star" : "@border-primary"
          }`}
        />
        {isError == true && errorMessage != "" && (
          <p className="@text-white @bg-orange-star/80 @my-2 @px-2 @rounded-lg">{errorMessage}</p>
        )}
      </div>
    </>
  );
}
