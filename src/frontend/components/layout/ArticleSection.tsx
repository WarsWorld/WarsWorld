import LinkCard, { ICardInfo } from "./LinkCard";
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
      <div className="@flex @flex-col monitor:@flex-row @items-center monitor:@space-x-8">
        <div className="@min-w-[75vw] monitor:@min-w-[20vw]">
          <TitleColorBox title={title} tailwind_color={tailwind_color} />
        </div>
        <p>{description}</p>
      </div>
      <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @w-full">
        {articles.map((item) => (
          <LinkCard key={item.key} cardInfo={item} />
        ))}
      </div>
    </section>
  );
}
