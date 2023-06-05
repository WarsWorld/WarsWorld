interface Props {
  title: string;
  color?: string;
}

export default function TitleColorBox({ title, color }: Props) {
  return (
    <div
      className={
        "@px-4 @rounded-md @w-full laptop:@max-w-[20vw] @text-center @my-2 @shadow-black/50 @shadow-md " +
        (color == null ? "@bg-blue-500" : color)
      }
    >
      <h1 className="@font-semibold @uppercase">{title}</h1>
    </div>
  );
}
