import Image from "next/image";
import Link from "next/link";

export interface ICardInfo {
  imgSrc: string;
  imgAlt: string;
  imgWidth: number;
  imgHeight: number;
  heading: string;
  text: string;
  link: string;
  key?: string;
}

interface Props {
  cardInfo: ICardInfo;
}

export default function LinkCard({ cardInfo }: Props) {
  return (
    <div className="@relative @bg-black/50 @object-cover @min-h-[300px] @max-w-[450px] @transform @cursor-pointer @duration-300 tablet:hover:@scale-110 tablet:hover:@shadow-[0_0_10px_10px_rgba(183,234,184,0.5)] tablet:hover:@z-10">
      <Link href={cardInfo.link} className="@absolute @h-full @w-full" />
      <div className="@flex @flex-col @space-y-2">
        <Image
          className="@w-full @max-h-[25vh] @object-cover @object-top"
          src={cardInfo.imgSrc}
          alt={cardInfo.imgAlt}
          width={cardInfo.imgWidth}
          height={cardInfo.imgHeight}
        />
        <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4">
          <h2 className="@font-semibold">{cardInfo.heading}</h2>
          <p>{cardInfo.text}</p>
        </div>
      </div>
    </div>
  );
}
