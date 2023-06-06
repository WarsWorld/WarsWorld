interface Props {
  title: string;
  tailwind_color?: string;
}

export default function TitleColorBox({ title, tailwind_color }: Props) {
  return (
    <div
      className={
        "@px-4 @rounded-md @w-full @text-center @my-2 @shadow-black/50 @shadow-md " +
        (tailwind_color == null ? "@bg-blue-500" : tailwind_color)
      }
    >
      <h1 className="@font-semibold @uppercase">{title}</h1>
    </div>
  );
}
