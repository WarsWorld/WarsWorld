import type { ICardInfo } from "./LinkCard";
import LinkCard from "./LinkCard";
import LinkCardContainer from "./LinkCardContainer";
import TitleColorBox from "../TitleColorBox";

type Props = {
  title: string;
  description: string;
  tailwind_color?: string;
  articles: ICardInfo[];
};

export default function ArticleGroup({ title, description, tailwind_color, articles }: Props) {
  return (
    <section>
      <div className="@flex @flex-col @py-2 monitor:@flex-row @items-center monitor:@space-x-8">
        <div className="@min-w-[75vw] monitor:@min-w-[20vw]">
          <TitleColorBox title={title} tailwind_color={tailwind_color} />
        </div>
        <p className="@text-center @tablet:@text-start">{description}</p>
      </div>
      <LinkCardContainer>
        {articles.map((item, index) => (
          <LinkCard key={`${title}-${index}`} cardInfo={item} />
        ))}
      </LinkCardContainer>
    </section>
  );
}
