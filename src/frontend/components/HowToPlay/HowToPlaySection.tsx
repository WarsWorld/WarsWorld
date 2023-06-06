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
    alt: string;
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
      <div className="@flex @flex-col monitor:@flex-row @items-center monitor:@space-x-8">
        <div className="@min-w-[75vw] monitor:@min-w-[20vw]">
          <TitleColorBox title={title} tailwind_color={tailwind_color} />
        </div>
        <p>{description}</p>
      </div>
      <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @w-full">
        {articles.map((item) => (
          <ArticleLinkCard
            key={item.key}
            image={item.image}
            img_height="250px"
            img_width="450px"
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
