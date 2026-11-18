import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CareersClient } from "../src/app/[locale]/careers/CareersClient";
import { NeedsReview } from "../src/components/shared/NeedsReview";
import { resourceLinkAvailable } from "../src/lib/resource-links";
test("expired jobs are closed and active departments derive from managed jobs", () => {
 const base={id:"qa",dept:"QA 신규 부서",location:"QA",type:"정규직",active:true};
 const output=renderToStaticMarkup(createElement(CareersClient,{locale:"ko",careers:[{...base,title:"QA future job",deadline:"2099-12-31"},{...base,id:"old",title:"QA expired job",deadline:"2000-01-01"}]}));
 assert.ok(output.includes("QA future job"));assert.ok(output.includes("QA 신규 부서"));assert.ok(!output.includes("QA expired job"));assert.ok(!output.includes("KAKAO_APP_KEY"));assert.ok(!output.includes('href="/files/bayada-referral-letter.pdf"'));
});
test("public markup has no internal review annotations", () => {
 const output=renderToStaticMarkup(createElement(NeedsReview,{label:"QA internal review",note:"QA internal note"},"Public content"));
 assert.equal(output,"Public content");
});
test("local resources require a real file inside the public root", () => {
 const root=mkdtempSync(join(tmpdir(),"bayada-resource-qa-"));const file=join(root,"qa.pdf");
 try {writeFileSync(file,"QA synthetic file");assert.equal(resourceLinkAvailable("/qa.pdf",root),true);assert.equal(resourceLinkAvailable("/missing.pdf",root),false);assert.equal(resourceLinkAvailable("/../outside.pdf",root),false);assert.equal(resourceLinkAvailable("#",root),false);assert.equal(resourceLinkAvailable("/",root),false);}
 finally {unlinkSync(file);rmdirSync(root);}
});
