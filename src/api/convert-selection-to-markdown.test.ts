/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test } from "vitest";
import { convertSelectionToMarkdown } from "./convert-selection-to-markdown";

test("convertSelectionToMarkdown", async () => {
  const markdown = await convertSelectionToMarkdown(
    "<div>hello<p id='second'>world <a href='#inner'>test</a> <a href='/inner'>test</a> <a href='https://fibery.io'>test</a></p><img alt='' src='/img.jpg' /><br/><img alt='' src='img.jpg' /><br/><img alt='' src='https://fibery.io/img.jpg' /> ellow</div>",
    "http://fibery.io/page"
  );
  expect(markdown).toMatchSnapshot(`<p>hello</p><p>world</p>`);
});
