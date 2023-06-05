import ArticleLinkCard from "../layout/ArticleLinkCard";
import TitleColorBox from "../layout/TitleColorBox";

interface Props {
  title: string;
  description: string;
  tailwind_color?: string;
  articles: {
    key: string;
    heading: string;
    text: string;
    image: string;
    link: string;
  }[];
}

export default function HowToPlaySection({
  title,
  description,
  tailwind_color,
  articles,
}: Props) {
  return (
    <section>
      <div className="@flex @flex-col laptop:@flex-row @items-center laptop:@space-x-8">
        <div className="@min-w-[75vw] laptop:@min-w-[25vw]">
          <TitleColorBox title={title} tailwind_color={tailwind_color} />
        </div>
        <p>{description}</p>
      </div>
      <div className="@grid @grid-flow-row @grid-cols-1 smallscreen:@grid-cols-2 laptop:@grid-cols-3 smallscreen:@gap-x-8 laptop:@gap-x-10">
        {articles.map((item) => (
          <ArticleLinkCard
            key={item.key}
            image={item.image}
            heading={item.heading}
            text={item.text}
            link={item.link}
          />
        ))}
      </div>
    </section>
  );
}
