import Image from "next/image";
import { useWindowWidth } from "@react-hook/window-size";
import { useEffect, useState } from "react";

export default function Banner2(props: {
  title: React.ReactElement | React.ReactElement[];
  backgroundURL: string;
}) {
  const screenWidth = useWindowWidth();

  const [cos, setCos] = useState(<></>);

  useEffect(() => {
    if (screenWidth < 1024) {
      setCos(
        <div className="@relative @z-10">
          <Image
            className="@absolute @left-[50vw] tablet:@left-[67.5vw] @h-[120vh] @top-[5vh] @w-auto"
            alt=""
            src="/img/CO/smoothFull/Awds-sasha.webp"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
      );
    } else {
      setCos(
        <div className="@relative @z-10">
          <Image
            className="@absolute @left-[52.5vw] @h-[120vh] @top-[5vh] @w-auto"
            alt=""
            src="/img/CO/smoothFull/Awds-sami.webp"
            width={0}
            height={0}
            sizes="100vw"
          />
          <Image
            className="@absolute @left-[67.5vw] @h-[120vh] @top-[5vh] @w-auto"
            alt=""
            src="/img/CO/smoothFull/Awds-sasha.webp"
            width={0}
            height={0}
            sizes="100vw"
          />
          <Image
            className="@absolute @left-[80vw] @h-[120vh] @top-[5vh] @w-auto"
            alt=""
            src="/img/CO/smoothFull/Awds-nell.webp"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
      );
    }
  }, [screenWidth]);
  return (
    <div className="@relative @h-[70vh] tablet:@h-[90vh] @overflow-hidden @shadow-black @shadow-2xl">
      <Image
        className={`@object-cover @w-full @absolute @h-full @z-0`}
        alt=""
        src={props.backgroundURL}
        width={0}
        height={0}
        sizes="100vw"
      />
      <div className="@absolute @flex @items-start @gap-10 @h-full @w-full @backdrop-brightness-[0.25] @z-10"></div>
      <div className="@flex @items-start @gap-10 @h-full @top-[20vh] @left-[3.5vw] tablet:@left-[7.5vw] @absolute @z-20">
        <div>{props.title}</div>
      </div>
      {cos}
    </div>
  );
}
