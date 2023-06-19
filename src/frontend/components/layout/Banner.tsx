import Image from "next/image";
import { ReactElement } from "react";
interface imageData {
  className: string;
  alt: string;
  src: string;
  width: number;
  height: number;
}
export default function Banner(props: {
  image1?: imageData;
  title: ReactElement;
  image2?: imageData;
}) {
  return (
    <div className="@bg-cover @bg-[url('/img/layout/homeBanner/gameCollage.jpg')]">
      <div className="@flex @items-start @gap-10 @backdrop-brightness-50 @px-10 @py-40">
        {props.image1 && <Image {...props.image1} />}
        <div>{props.title}</div>
        {props.image2 && <Image {...props.image2} />}
      </div>
    </div>
  );
}
