import path from "path";
import * as fs from "fs";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { string, z } from "zod";

// Creates a path from the cwd/current working directory to /article
const articleDir = path.join(process.cwd(), "src/frontend/utils/articles");

const metaDataSchema = z.object({
  title: z.string(), // This is the id
  description: z.string(),
  date: z.string(),
  category: z.string(),
  image: z.string(),
  imageAlt: z.string()
});

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
    const title = articleName.replace(/\.md$/, "");
    metaData.data.title = title
    
    return {
      metaData: metaDataSchema.parse(metaData.data),
      slug: stringToSlug(title)
    }
  });
  //sort articleData by date
  return allArticlesData.sort((a, b) => {
    if (a.metaData.date < b.metaData.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export type ArticleMetaData = Awaited<ReturnType<typeof getSortedArticles>>;

// gets the different article slugs so we know which are valid and which arent
export function getArticleSlugs() {
  const articleNames = fs.readdirSync(articleDir);
  return articleNames.map((articleName) => {
    const title = articleName.replace(/\.md$/, "");
    return {
      params: {
        //take out md so its just the id (title)
        id: stringToSlug(title)
      }
    };
  });
}

export async function getArticleData(slug: string) {
  const articleNames = fs.readdirSync(articleDir);

  let originalFileName = ""

  // turns every articleName into its slug counter part
  // compare each articleName slug with the argument slug
  // if the same, then thats the article we need to render
  for(const articleName of articleNames){
    const articleNameSlug = stringToSlug(articleName.replace(/\.md$/, ""))
    
    if(articleNameSlug == slug){
      originalFileName = articleName
    }
  }
  // NOTE: MIGHT NEED REVISION IN THE FUTURE
  // As the two titles below are indistinguishable:
  // Welcome back Flak!! Patch 1.0.1
  // Welcome back Flak! Patch 1.01

  const fileContents = fs.readFileSync(`${articleDir}/${originalFileName}`, "utf-8");
  // Use gray-matter to parse the post metadata section
  const metaData = matter(fileContents);
  metaData.data.title = originalFileName.replace(/\.md$/, "");

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(metaData.content);
  const contentHtml = processedContent.toString();

  // Combine the data
  return {
    contentHtml,
    metaData: metaDataSchema.parse(metaData.data)
  };
}

export type ArticleData = Awaited<ReturnType<typeof getArticleData>>;

const stringToSlug = (title: string) => title.replace(/\s/g, "-").replace(/[^\w\s-]/gi, '').toLowerCase()