import Image from "next/image";
import Link from "next/link";

const MAX_DESC_LENGTH = 120;
const MAX_TITLE_LENGTH = 48;

export type ICardInfo = {
  title: string;
  description: string;
  date?: string;
  category?: string;
  thumbnail: string;
  thumbnailAlt: string;
  subdirectory: string;
};

type Props = {
  cardInfo: ICardInfo;
};

export default function LinkCard({ cardInfo }: Props) {
  const trimmedTitle =
    cardInfo.title.length > MAX_TITLE_LENGTH
      ? cardInfo.title.substring(0, MAX_TITLE_LENGTH - 3) + "..."
      : cardInfo.title;
  const trimmedDescription =
    cardInfo.description.length > MAX_DESC_LENGTH
      ? cardInfo.description.substring(0, MAX_DESC_LENGTH - 3) + "..."
      : cardInfo.description;

  return (
    <div className="@relative @bg-black/50 @object-cover @h-[380px] laptop:@h-[478px] ultra:@h-[720px] @w-[320px] laptop:@w-[400px] ultra:@w-[640px] @transform @cursor-pointer @border-transparent @border-4 hover:@-translate-y-1 hover:@border-primary hover:@bg-gray-900/50 tablet:hover:@z-10 @duration-200 @ease-in">
      <Link href={`${cardInfo.subdirectory}`} className="@absolute @h-full @w-full @z-10" />
      <div className="@grid @grid-rows-2 @h-full">
        <Image
          className="@grid-rows-1 @w-[320px] @h-[180px] laptop:@w-[400px] laptop:@h-[225px] ultra:@w-[640px] ultra:@h-[360px] @object-cover"
          src={cardInfo.thumbnail}
          alt={cardInfo.thumbnailAlt}
          width={640}
          height={360}
        />
        <div className="@relative @grid-rows-1 @h-full @px-2 laptop:@px-4 laptop:@pb-4 ultra:@my-4">
          <h2 className="@text-2xl ultra:@text-4xl @font-semibold">{trimmedTitle}</h2>
          <p className="ultra:@text-2xl ultra:@mt-4">{trimmedDescription}</p>
          <p className="@absolute @bottom-2 ultra:@text-2xl laptop:@bottom-4 @right-2 laptop:@right-4 ultra:@bottom-8">
            {cardInfo.date}
          </p>
          <p className="@absolute @bottom-2 ultra:@text-2xl laptop:@bottom-4 @left-2 laptop:@left-4 ultra:@bottom-8">
            {cardInfo.category}
          </p>
          {/* <p className="@h-full">{cardInfo.text}</p> */}
        </div>
      </div>
    </div>
  );
}
