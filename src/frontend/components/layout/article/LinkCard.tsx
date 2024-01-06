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
    <div className="@relative @bg-black/50 @object-cover @h-[478px] @w-full @transform @cursor-pointer @border-transparent @border-2 hover:@-translate-y-1 hover:@border-primary tablet:hover:@z-10 hover:@bg-bg-primary/90 @duration-200 @ease-in">
      <Link href={`${cardInfo.subdirectory}`} className="@absolute @h-full @w-full @z-10" />
      <div className="@grid @grid-rows-2 @h-full">
        <Image
          className="@grid-rows-1 @w-full @h-full @object-cover @object-top"
          src={cardInfo.image}
          alt={cardInfo.imageAlt}
          width={0}
          height={0}
          sizes="100vw"
        />
        <div className="@relative @grid-rows-1 @h-full @px-2 laptop:@px-4 @py-4 laptop:@pb-4">
          <h2 className="@text-[2.5vh] @font-semibold">{cardInfo.title}</h2>
          <p className="">{cardInfo.description}</p>
          <p className="@absolute @bottom-4 @right-4">{cardInfo.date}</p>
          <p className="@absolute @bottom-4 @left-4">{cardInfo.category}</p>
          {/* <p className="@h-full">{cardInfo.text}</p> */}
        </div>
      </div>
    </div>
  );
}
