import path from "path";
import * as fs from "fs";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// Creates a path from the cwd/current working directory to /article
const articleDir = path.join(process.cwd(), "src/frontend/utils/articles");

export function getSortedArticles() {
  const articleNames = fs.readdirSync(articleDir);
  const allArticlesData = articleNames.map((articleName) => {
    //read markdown as string
    const fileContents = fs.readFileSync(
      `${articleDir}/${articleName}`,
      "utf-8"
    );

    //use gray-matter dependency to parse the post metadata section
    const metaData = matter(fileContents);

    return {
      ...metaData.data,
    };
  });
  //sort articleData by date
  return allArticlesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

//gets the different articleIDs so we know which /article/pageName
// are valid and which arent
export function getArticleIds() {
  const articleNames = fs.readdirSync(articleDir);
  return articleNames.map((articleName) => {
    return {
      params: {
        //take out md so its just the id
        id: articleName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getArticleData(id: string) {
  const fileContents = fs.readFileSync(`${articleDir}/${id}.md`, "utf-8");
  // Use gray-matter to parse the post metadata section
  const metaData = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(metaData.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...metaData.data,
  };
}
