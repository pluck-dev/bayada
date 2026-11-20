import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import postcss from 'postcss';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await build({absWorkingDir:root,entryPoints:['src/review/client.tsx'],outfile:'public/review/client.js',bundle:true,format:'esm',platform:'browser',target:['es2020'],jsx:'automatic',minify:true,define:{'process.env.NODE_ENV':'"production"'},loader:{'.woff2':'file'},assetNames:'fonts/[name]-[hash]',publicPath:'/review',alias:{'next/navigation':path.join(root,'src/review/navigation.ts')}});

for (const name of ['Figtree-LICENSE.txt','Pretendard-LICENSE.txt']) await copyFile(path.resolve(root,'../../packages/review-ui/src/fonts',name),path.join(root,'public/review',name));

const cssPath=path.join(root,'public/review/client.css');
const css=postcss.parse(await readFile(cssPath,'utf8'));
css.walkRules(rule=>{let parent=rule.parent;while(parent){if(parent.type==='atrule'&&parent.name.endsWith('keyframes'))return;parent=parent.parent;}rule.selectors=rule.selectors.map(selector=>'.korea-review-active '+selector);});
const reset='.korea-review-active .foundation-theme :where(button:not(.ui-button)){appearance:none;background:transparent;border:0;margin:0;padding:0;color:inherit;font:inherit}';
await writeFile(cssPath,reset+css.toString());
