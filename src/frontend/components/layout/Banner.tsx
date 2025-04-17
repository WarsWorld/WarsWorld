import Image from "next/image";

export default function Banner2(props: {
  title: React.ReactElement | React.ReactElement[];
  backgroundURL: string;
}) {
  return (
    <div className="@relative @h-[65vh] @w-full tablet:@h-[90vh] @overflow-hidden @shadow-black @shadow-2xl">
      <Image
        className="@object-cover @object-top @w-full @absolute @h-full @z-0"
        alt=""
        src={props.backgroundURL}
        width={0}
        height={0}
        sizes="100vw"
        priority
      />
      <div className="@absolute @flex @items-start @gap-10 @h-full @w-full @backdrop-brightness-[0.15] @z-10"></div>
      <div className="@flex @items-start @gap-10 @h-full @w-full @absolute @z-20">
        <div className="@h-full @w-full">{props.title}</div>
      </div>
    </div>
  );
}
