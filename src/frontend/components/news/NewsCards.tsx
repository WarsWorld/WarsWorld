import Image from "next/image";
import { newsCardsObject } from "pages/news";

interface Props {
  newsCardInfo: newsCardsObject;
}

export function NewsCards({ newsCardInfo }: Props) {
  return (
    <div className="@bg-bg-primary @object-cover @min-h-[300px] @transform @cursor-pointer @duration-300 tablet:hover:@scale-110 tablet:hover:@shadow-[0_0_10px_10px_rgba(183,234,184,0.5)] tablet:hover:@z-10">
      <div className="@flex @justify-center @items-center @w-full @h-[200px] @overflow-hidden">
        <Image
          src={newsCardInfo.imgSrc}
          alt={newsCardInfo.imgAlt}
          width={newsCardInfo.imgWidth}
          height={newsCardInfo.imgHeight}
        />
      </div>
      <div className="@h-30 @bg-bg-secondary @p-2 @h-[130px] @w-full tablet:@w-[300px]">
        <h1 className="@text-[1.25rem]">{newsCardInfo.cardTitle}</h1>
        <p className="@text-xs @leading-loose">
          {newsCardInfo.cardDescription}
        </p>
      </div>
    </div>
  );
}
