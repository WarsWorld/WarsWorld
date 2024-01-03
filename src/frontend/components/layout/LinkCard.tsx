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
    <div className="@relative @bg-black/50 @object-cover @h-[450px] @w-full @transform @cursor-pointer @duration-300 tablet:hover:@scale-110 tablet:hover:@z-10">
      <Link href={`${cardInfo.subdirectory}`} className="@absolute @h-full @w-full @z-10" />
      <div className="@grid @grid-rows-2 @h-full">
        <Image
          className="@grid-rows-1 @w-full @h-full @object-cover @object-top"
          src={cardInfo.image}
          alt={cardInfo.imageAlt}
          width={300}
          height={300}
        />
        <div className="@relative @grid-rows-1 @h-full @px-2 laptop:@px-4 @py-2 laptop:@pb-4">
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
