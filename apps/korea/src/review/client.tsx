import { createRoot } from 'react-dom/client';
import ReviewTools from '@bayada/review-ui/tools';
document.body.classList.add("korea-review-active");
const root = document.createElement('div'); root.setAttribute('data-element-inspector',''); document.body.append(root);
createRoot(root).render(<ReviewTools site="web"/>);
