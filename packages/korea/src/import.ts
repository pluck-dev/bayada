import { prisma } from "@bayada/db";
import records from "../content/boards.json";
import { parsePost } from "./model";
import { cleanRichText } from "./server";
async function main() {
  const count = await prisma.$transaction(async tx => {
    const key = "korea.wordpress.public-content.v1";
    if (await tx.siteSetting.findUnique({ where: { key } })) return 0;
    const data = records.map(value => {
      const post = parsePost(value); post.content = cleanRichText(post.content);
      return { slug: `korea/post/${post.board}/${post.id}`, title: post.title, content: JSON.stringify(post) };
    });
    const result = await tx.page.createMany({ data, skipDuplicates: true });
    await tx.siteSetting.create({ data: { key, value: { count: result.count, importedAt: new Date().toISOString(), publicOnly: true } } });
    return result.count;
  });
  console.log(JSON.stringify({ imported: count }));
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Import failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
