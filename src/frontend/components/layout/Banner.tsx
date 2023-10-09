import Image from "next/image";

export default function Banner2(props: {
  title: React.ReactElement | React.ReactElement[];
  backgroundURL: string;
}) {
  return (
    <div className="@relative @h-[90vh] @overflow-hidden @shadow-black @shadow-2xl">
      <div
        style={{ backgroundImage: `url(${props.backgroundURL})` }}
        className={`@bg-cover @w-full @absolute @h-full`}
      >
        <div className="@flex @items-start @gap-10 @h-full @backdrop-brightness-[0.25]"></div>
      </div>
      <div className="@flex @items-start @gap-10 @h-full @top-[20vh] @left-[7.5vw] @absolute @z-20">
        <div>{props.title}</div>
      </div>
      <div className="@relative @z-10">
        <img
          className="@absolute @left-[52.5vw] @h-[120vh]"
          alt=""
          src="img/CO/smoothFull/Awds-sami.webp"
        />
        <img
          className="@absolute @left-[67.5vw] @h-[120vh]"
          alt=""
          src="img/CO/smoothFull/Awds-sasha.webp"
        />
        <img
          className="@absolute @left-[80vw] @h-[120vh]"
          alt=""
          src="img/CO/smoothFull/Awds-nell.webp"
        />
      </div>
    </div>
  );
}
