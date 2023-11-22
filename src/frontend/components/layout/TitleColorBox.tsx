type Props = {
  title: string;
  tailwind_color?: string;
}

export default function TitleColorBox({ title, tailwind_color }: Props) {
  return (
    <div className={"@px-4 @rounded-md @w-full @text-center @my-2 @shadow-black/50 @shadow-md " + (tailwind_color ?? "@bg-blue-500")}>
      <h1 className="@font-semibold @uppercase">{title}</h1>
    </div>
  );
}
