import type { ICardInfo } from "./LinkCard";
import LinkCard from "./LinkCard";
import TitleColorBox from "./TitleColorBox";

interface Props {
  title: string;
  description: string;
  tailwind_color?: string;
  articles: ICardInfo[];
}

export default function ArticleSection({
  title,
  description,
  tailwind_color,
  articles,
}: Props) {
  return (
    <section>
      <div className="@flex @flex-col @py-2 monitor:@flex-row @items-center monitor:@space-x-8">
        <div className="@min-w-[75vw] monitor:@min-w-[20vw]">
          <TitleColorBox title={title} tailwind_color={tailwind_color} />
        </div>
        <p className="@text-center @tablet:@text-start">{description}</p>
      </div>
      <div className="@flex @flex-col @gap-8 @justify-center @items-center @my-4 smallscreen:@grid smallscreen:@grid-flow-row smallscreen:@grid-cols-2 laptop:@grid-cols-3 monitor:@grid-cols-4 large_monitor:@grid-cols-5">
        {articles.map((item) => (
          <LinkCard key={item.key} cardInfo={item} />
        ))}
      </div>
    </section>
  );
}
