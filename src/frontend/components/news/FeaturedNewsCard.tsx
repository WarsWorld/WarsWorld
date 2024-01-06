import Image from "next/image";
import Link from "next/link";

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
    <div className="@w-full @h-[70vh] @my-4 hover:@-translate-y-2 @duration-100 @ease-in">
      <Link href={`${cardInfo?.subdirectory}`} className="@w-full @z-10">
      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />
      <div className="@flex @justify-between @items-center @w-full @bg-black/50 @h-full hover:@bg-bg-secondary/50 @duration-100 @ease-in">
        <div className="@relative @w-[30%] @h-full @py-8 @ml-20">
          <h2 className="@text-6xl @font-semibold @my-8">{cardInfo?.title}</h2>
          <div className="@text-white">
            <p className="@text-2xl">{cardInfo?.description}</p>
            <p className="@absolute @bottom-10 @text-2xl">{cardInfo?.date}</p>
            <p className="@absolute @bottom-10 @right-12 @text-2xl">{cardInfo?.category}</p>
          </div>
        </div>
        <div className="@w-auto @h-full @p-1 @mx-10 @mr-24">
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
      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />
      </Link>
    </div>
  );
}
