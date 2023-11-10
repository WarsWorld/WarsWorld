import Image from "next/image";
export default function SmallContainer(props: {
  image: string;
  alt: string;
  title: string;
  text: string;
}) {
  return (
    <div className="@flex @rounded-2xl @relative hover:@scale-[1.015] @transition @drop-shadow-[10px_10px_10px_rgba(0,0,0,0.25)] @overflow-hidden">
      <Image
        className="@brightness-90 @h-auto @min-w-[250px]"
        src={`/img/layout/${props.image}.jpg`}
        alt={props.alt}
        width={380}
        height={600}
      />
      <div className="@text-center @p-2 @absolute @bottom-0 @z-10 @backdrop-brightness-[.3]">
        <h2 className="@text-white">
          <strong>{props.title}</strong>
        </h2>
        <p>{props.text}</p>
      </div>
    </div>
  );
}
