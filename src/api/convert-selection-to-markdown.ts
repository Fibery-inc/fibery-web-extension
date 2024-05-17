import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visitParents } from "unist-util-visit-parents";

export async function convertSelectionToMarkdown(
  html: string,
  pageUrl: string
): Promise<string> {
  try {
    const file = await unified()
      .use(rehypeParse)
      // @ts-ignore
      .use(rehypeRemark)
      .use(() => {
        return (tree) => {
          // @ts-ignore
          visitParents(tree, ["image", "link"], (node: any) => {
            const src = (node?.url as string) || "";
            if (!src || !pageUrl) {
              return;
            }
            if (src.startsWith("http")) {
              return;
            }
            if (src.startsWith("/")) {
              const hostname = new URL(pageUrl).hostname;
              node.url = `https://${hostname}${src}`;
              return;
            }
            node.url = `${
              pageUrl.endsWith("/") ? pageUrl : pageUrl + "/"
            }${src}`;
            return;
          });
          return tree;
        };
      })
      .use(remarkStringify)
      .process(html);
    return String(file);
  } catch (error) {
    console.error("Error converting selection to markdown", error);
    return "";
  }
}
