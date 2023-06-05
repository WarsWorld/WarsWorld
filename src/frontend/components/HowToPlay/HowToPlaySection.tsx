import ArticleLinkCard from "./ArticleLinkCard";
import TitleColorBox from "./TitleColorBox";

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
        <div className="laptop:@min-w-[20vw]">
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
