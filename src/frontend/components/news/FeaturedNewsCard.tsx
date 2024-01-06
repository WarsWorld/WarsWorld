import Image from "next/image";
import Link from "next/link";
import OrangeGradientLine from "../layout/decorations/OrangeGradientLine";

export type ICardInfo = {
  title: string;
  description: string;
  date?: string;
  category?: string;
  image: string;
  imageAlt: string;
  subdirectory: string;
};

type Props = {
  cardInfo: ICardInfo;
};

export function FeaturedNewsCard({ cardInfo } : Props) {
  return (
    <div className="@w-full laptop:@w-[101%] @h-[36rem] smallscreen:@h-[65vh] laptop:@-translate-x-2 laptop:hover:@translate-x-0 hover:@-translate-y-1 laptop:hover:@translate-y-0 @duration-200 @ease-in-out">
      <Link href={`${cardInfo?.subdirectory}`} className="@w-full @z-10">
      <OrangeGradientLine />
      <div className="@flex @flex-col-reverse laptop:@flex-row @justify-between @items-center @w-full @bg-black/50 @h-full hover:@bg-bg-primary/90 @duration-200 @ease-in">
        <div className="@relative @w-full laptop:@w-[40%] monitor:@w-[30%] @h-full @px-4 laptop:@py-8 laptop:@ml-16">
          <h2 className="@text-4xl monitor:@text-6xl @font-semibold @my-4 monitor:@my-8">{cardInfo?.title}</h2>
          <div className="@text-white">
            <p className="@text-xl laptop:@text-2xl smalscreen:@my-2">{cardInfo?.description}</p>
            <p className="@absolute @bottom-4 laptop:@bottom-10 @text-2xl">{cardInfo?.date}</p>
            <p className="@absolute @bottom-4 laptop:@bottom-10 @right-10 @text-2xl">{cardInfo?.category}</p>
          </div>
        </div>
        <div className="@w-full laptop:@w-auto laptop:@h-full @p-1 laptop:@mx-10 laptop:@mr-16">
          <Image
              className="@grid-rows-1 @w-full laptop:@w-auto @h-auto laptop:@h-full @object-cover @object-top"
              src={cardInfo?.image}
              alt={cardInfo?.imageAlt}
              width={0}
              height={0}
              sizes="100vw"
            />
        </div>
      </div>
      <OrangeGradientLine />
      </Link>
    </div>
  );
}
