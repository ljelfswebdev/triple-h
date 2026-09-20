import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local", quiet: true });

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

const termsQaContent = `
<h1>Terms and Conditions QA – Heading 1</h1>
<p>This is a standard paragraph containing <strong>bold text</strong>, <em>italic text</em>, <u>underlined text</u>, and <s>strikethrough text</s>.</p>
<h2>Heading 2 example</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Visit <a href="https://example.com" target="_blank" rel="noopener noreferrer">this example link in a new tab</a> to test linked text.</p>
<h3>Heading 3 example</h3>
<ul>
  <li>Unordered list item one</li>
  <li>Unordered list item two with <strong>bold text</strong></li>
  <li>Unordered list item three</li>
</ul>
<h4>Heading 4 example</h4>
<ol>
  <li>Numbered list item one</li>
  <li>Numbered list item two with <em>italic text</em></li>
  <li>Numbered list item three</li>
</ol>
<h5>Heading 5 example</h5>
<blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a blockquote example.</p></blockquote>
<p><code>const editorQa = "inline code example";</code></p>
<h2>Table example</h2>
<table>
  <thead>
    <tr><th>Feature</th><th>Example</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Formatting</td><td>Bold, italic and underline</td><td>Ready</td></tr>
    <tr><td>Lists</td><td>Bulleted and numbered</td><td>Ready</td></tr>
    <tr><td>Colours</td><td>Preset and custom text colours</td><td>Ready</td></tr>
  </tbody>
</table>
<h2>Text colour examples</h2>
<p><span style="color:#ff914d">Orange text</span> · <span style="color:#0b9ea6">Teal text</span> · <span style="color:#dc2626">Red text</span> · <span style="color:#2563eb">Blue text</span> · <span style="color:#16a34a">Green text</span> · <span style="color:#7c3aed">Purple text</span></p>
<p><span style="color:#a855f7">Custom colour example</span> followed by text using the default colour.</p>
`;

const legalPages = [
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    body: termsQaContent,
    seedBody: true,
  },
  { slug: "cookie-policy", title: "Cookie Policy" },
  { slug: "privacy-policy", title: "Privacy Policy" },
];

await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10_000,
});

try {
  const now = new Date();
  const result = await mongoose.connection.collection("pages").bulkWrite(
    legalPages.map(({ slug, title, body = "", seedBody = false }) => ({
      updateOne: {
        filter: { slug },
        update: {
          ...(seedBody
            ? { $set: { "content.body": body, updatedAt: now } }
            : {}),
          $setOnInsert: {
            slug,
            title,
            ...(!seedBody ? { content: { body } } : {}),
            seo: {},
            createdAt: now,
            ...(!seedBody ? { updatedAt: now } : {}),
          },
        },
        upsert: true,
      },
    })),
  );

  console.log(
    `Legal pages ready: ${result.upsertedCount} created, ${result.matchedCount} already existed.`,
  );
} finally {
  await mongoose.disconnect();
}
