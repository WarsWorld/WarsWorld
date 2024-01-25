import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export const stringToSlug = (title: string) => title.replace(/\s/g, "-").replace(/[^\w\s-]/gi, '').toLowerCase();

export function markdownToHTML(markdown: string) {
  const content = matter(markdown).content;
  const process = remark().use(html).processSync(content);
  return process.toString();
} 