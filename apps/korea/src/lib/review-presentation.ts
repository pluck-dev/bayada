import { reviewAccessEnabled, safeReviewDestination } from '@bayada/review/access';
import { escapeHtml } from '@bayada/korea';
export function addReviewEntry(html:string,url:URL){
 if(!reviewAccessEnabled())return html;
 const next=safeReviewDestination(url.pathname+url.search);
 return html.replace('</head>','<link rel="stylesheet" href="/review-entry.css"></head>').replace('</body>',`<a class="korea-review-entry" data-element-inspector href="/review-access?next=${escapeHtml(encodeURIComponent(next))}">리뷰 · 피드백</a><script type="module" src="/review-loader.js"></script></body>`);
}
