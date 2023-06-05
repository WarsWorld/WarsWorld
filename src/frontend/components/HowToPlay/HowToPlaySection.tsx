import ArticleLinkCard from "./ArticleLinkCard";
import TitleColorBox from "./TitleColorBox";

interface Props {
  key: string;
  title: string;
  description: string;
  color?: string;
  articles: {
    key: string;
    heading: string;
    text: string;
    image: string;
    link: string;
  }[];
}

export default function HowToPlaySection({
  key,
  title,
  description,
  color,
  articles,
}: Props) {
  return (
    <section key={key}>
      <div className="@flex @flex-col laptop:@flex-row @items-center laptop:@space-x-8">
        <TitleColorBox title={title} color={color} />
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
