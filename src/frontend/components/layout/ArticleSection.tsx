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
    alt: string;
    link: string;
  }[];
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
      <div className="@grid @grid-flow-row @grid-cols-1 smallscreen:@grid-cols-2 laptop:@grid-cols-3  monitor:@grid-cols-4 large_monitor:@grid-cols-5 smallscreen:@gap-x-8 laptop:@gap-x-10">
        {articles.map((item) => (
          <ArticleLinkCard
            key={item.key}
            image={item.image}
            img_height="275px"
            heading={item.heading}
            text={item.text}
            alt={item.alt}
            link={item.link}
          />
        ))}
      </div>
    </section>
  );
}
