import Image from "next/image";
import Link from "next/link";
import OrangeGradientLine from "../layout/decorations/OrangeGradientLine";

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

export function FeaturedNewsCard({ cardInfo } : Props) {
  return (
    <>
     <OrangeGradientLine />
        <div className="@overflow-hidden">
          <div className="@w-full laptop:@w-[101%] @h-[36rem] smallscreen:@h-[48rem] laptop:@h-[380px] desktop:@h-[398px] monitor:@h-[596px] large_monitor:@h-[740px] ultra:@h-[1100px] laptop:@-translate-x-4 laptop:hover:@translate-x-0 hover:@-translate-y-1 laptop:hover:@translate-y-0 @duration-500 @ease-in-out">
            <Link href={`${cardInfo?.subdirectory}`} className="@w-full @h-full @z-10">
              <div className="@flex @flex-col-reverse laptop:@flex-row @justify-left @items-center @w-full @bg-black/50 @h-full @duration-200 @ease-in">
                <div className="@relative @w-full laptop:@w-[65%] @h-full @px-8 laptop:@py-8 laptop:@ml-6 large_monitor:@ml-28">
                  <h2 className="@text-4xl monitor:@text-6xl large_monitor:@text-9xl @font-semibold @my-4 monitor:@my-8">{cardInfo?.title}</h2>
                  <div className="@text-white">
                    <p className="@text-xl laptop:@text-2xl large_monitor:@text-4xl smalscreen:@my-2">{cardInfo?.description}</p>
                    <p className="@absolute @bottom-4 laptop:@bottom-10 @text-2xl large_monitor:@text-4xl">{cardInfo?.date}</p>
                    <p className="@absolute @bottom-4 laptop:@bottom-10 @right-12 @text-2xl large_monitor:@text-4xl">{cardInfo?.category}</p>
                  </div>
                </div>
                <Image 
                    className="@w-full laptop:@w-[640px] desktop:@w-[672px] monitor:@w-[1024px] large_monitor:@w-[1280px] ultra:@w-[1920px] @h-full laptop:@h-[360px] desktop:@h-[378px] monitor:@h-[576px] large_monitor:@h-[720px] ultra:@h-[1080px] @object-cover @mr-4"
                    src={cardInfo?.thumbnail}
                    alt={cardInfo?.thumbnailAlt} 
                    width={1920}
                    height={1080}
                    priority
                    />
              </div>
            </Link>
          </div>
        </div>
      <OrangeGradientLine />
    </>
  );
}
