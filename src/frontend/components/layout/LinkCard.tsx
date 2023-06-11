import Image from "next/image";
import Link from "next/link";

export interface ICardInfo {
  imgSrc: string;
  imgAlt: string;
  heading: string;
  text: string;
  link: string;
  imgWidth?: number;
  imgHeight?: number;
  key?: string;
}

interface Props {
  cardInfo: ICardInfo;
}

export default function LinkCard({ cardInfo }: Props) {
  return (
    <div className="@relative @bg-black/50 @object-cover @max-w-[450px] @transform @cursor-pointer @duration-300 tablet:hover:@scale-110 tablet:hover:@z-10">
      <Link href={cardInfo.link} className="@absolute @h-full @w-full" />
      <div className="@flex @flex-col @space-y-2">
        <Image
          className="@w-full @h-[200px] @object-cover @object-top"
          src={cardInfo.imgSrc}
          alt={cardInfo.imgAlt}
          width={cardInfo.imgWidth ? cardInfo.imgWidth : 300}
          height={cardInfo.imgHeight ? cardInfo.imgWidth : 300}
        />
        <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4 @h-[20vh]">
          <h2 className="@text-[2.5vh] @font-semibold">{cardInfo.heading}</h2>
          <p>{cardInfo.text}</p>
        </div>
      </div>
    </div>
  );
}
