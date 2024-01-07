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

export default function LinkCard({ cardInfo }: Props) {
  return (
    <div className="@relative @bg-black/50 @object-cover @h-[380px] laptop:@h-[478px] @w-[320px] laptop:@w-[400px] @transform @cursor-pointer @border-transparent @border-2 hover:@-translate-y-1 hover:@border-primary tablet:hover:@z-10 hover:@bg-bg-primary/90 @duration-200 @ease-in">
      <Link href={`${cardInfo.subdirectory}`} className="@absolute @h-full @w-full @z-10" />
      <div className="@grid @grid-rows-2 @h-full">
        <img
          className="@grid-rows-1 @w-[320px] @h-[180px] laptop:@w-[400px] laptop:@h-[225px] @object-cover"
          src={cardInfo.image}
          alt={cardInfo.imageAlt}
        />
        <div className="@relative @grid-rows-1 @h-full @px-2 laptop:@px-4 laptop:@pb-4">
          <h2 className="@text-2xl @font-semibold">{cardInfo.title}</h2>
          <p className="">{cardInfo.description}</p>
          <p className="@absolute @bottom-2 laptop:@bottom-4 @right-2 laptop:@right-4">{cardInfo.date}</p>
          <p className="@absolute @bottom-2 laptop:@bottom-4 @left-2 laptop:@left-4">{cardInfo.category}</p>
          {/* <p className="@h-full">{cardInfo.text}</p> */}
        </div>
      </div>
    </div>
  );
}
