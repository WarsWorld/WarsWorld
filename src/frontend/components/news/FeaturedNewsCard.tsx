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
    <div className="@w-[101%] @h-[70vh] @-translate-x-2 hover:@translate-x-0 @duration-200 @ease-in-out">
      <Link href={`${cardInfo?.subdirectory}`} className="@w-full @z-10">
      <OrangeGradientLine />
      <div className="@flex @justify-between @items-center @w-full @bg-black/50 @h-full hover:@bg-bg-primary/90 @duration-200 @ease-in">
        <div className="@relative @w-[30%] @h-full @py-8 @ml-16">
          <h2 className="@text-6xl @font-semibold @my-8">{cardInfo?.title}</h2>
          <div className="@text-white">
            <p className="@text-2xl">{cardInfo?.description}</p>
            <p className="@absolute @bottom-10 @text-2xl">{cardInfo?.date}</p>
            <p className="@absolute @bottom-10 @right-12 @text-2xl">{cardInfo?.category}</p>
          </div>
        </div>
        <div className="@w-auto @h-full @p-1 @mx-10 @mr-16">
          <Image
              className="@grid-rows-1 @w-auto @h-full @object-cover @object-top"
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
