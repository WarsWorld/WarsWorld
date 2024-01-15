import styles from "frontend/styles/pages/articles.module.scss";

type Props = {
  contentHTML: string,
}

export default function ArticleContent({ contentHTML }: Props) {
  const headers = [...contentHTML.matchAll(/<h1+>(.*?)<\/h1*>/gm)];

  // Styling
  contentHTML = contentHTML.replaceAll(
    /<h2>/g,
    `<h2 class="smallscreen:@py-4 @px-4 @text-3xl smallscreen:@text-5xl @font-light">`
  );
  contentHTML = contentHTML.replaceAll(
    /<p>/g,
    `<p class="@my-4 @px-2 @text-xl smallscreen:@text-2xl @font-light">`
  );
  contentHTML = contentHTML.replaceAll(
    /<img/g,
    `<img class="@my-6"`
  );
  contentHTML = contentHTML.replaceAll(
    /<li>/g,
    `<li class="@ml-10 @my-4 @px-4 @text-xl">`
  );
  contentHTML = contentHTML.replaceAll(
    /<ol>/g,
    `<ol class="smallscreen:@ml-10 @list-disc">`
  );
  contentHTML = contentHTML.replaceAll(
    /<ul>/g,
    `<ul class="@list-disc">`
  );

  // Put IDs on headers so /articleName#header links to the header
  for (const header of headers) {
    contentHTML = contentHTML.replace(
      /<h1>/,
      `<h1 class="smallscreen:@py-5 @px-2 @text-4xl smallscreen:@text-6xl @font-medium " id="${header[1].replace(/\s/g, "-")}">`
    );
  }

  return (
    <div className="@grid @grid-cols-12 @py-8 @px-4 @pl-16 @relative @leading-10">
      <div className="@col-span-12 smallscreen:@col-span-10">
        <article
          className={`@bg-black/70 smallscreen:@p-10 @p-2 ${styles.articleGrid} @list-disc [&>p]:inline @rounded-2xl`}
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
      </div>

      <div className="@my-8 smallscreen:@my-0 @mx-0 smallscreen:@mx-2 @col-span-12 smallscreen:@col-span-2 @bg-black/70 @sticky @top-[10vw] @h-max @rounded-2xl">
        <h1 className="@text-3xl @text-center @my-2">INDEX</h1>
        {headers.map((item) => {
          return (
            <a
              key={item[1]}
              href={`#${item[1].replace(/\s/g, "-")}`}
              className={"@text-primary @text-base monitor:@text-xl @block @py-2 @px-2 @m-2 @rounded-2xl hover:@text-primary hover:@translate-x-1"}
            >
              {item[1]}
            </a>
          );
        })}
      </div>
    </div>    
  )
}