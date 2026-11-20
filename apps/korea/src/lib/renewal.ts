import { escapeHtml as e, safeUrl, type KoreaPage, type MenuItem } from '@bayada/korea';
import type { PagePresentation } from '@bayada/korea/server';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const href = (url: string, media = false) => e(safeUrl(url, media) ? url : '#');
const consultation = '/서비스상담/';
const matchPath = (a: string, b: string) => { try { return decodeURI(a).replace(/\/$/, '') === decodeURI(b).replace(/\/$/, ''); } catch { return false; } };
function link(item: MenuItem, path: string): string {
  return `<a href="${href(item.href)}"${matchPath(item.href,path)?' aria-current="page"':''}${item.newTab?' target="_blank" rel="noopener noreferrer"':''}>${e(item.label)}</a>`;
}
function navigation(items: MenuItem[], path: string): string {
  return items.map(item => item.children.length ? `<details class="rn-nav-group"><summary${item.children.some(c=>matchPath(c.href,path))?' class="is-current"':''}>${e(item.label)}<span aria-hidden="true">⌄</span></summary><div class="rn-dropdown">${link({...item,label:'전체 보기'},path)}${item.children.map(c=>`<div>${link(c,path)}${c.children.length?`<div class="rn-subnav">${c.children.map(n=>link(n,path)).join('')}</div>`:''}</div>`).join('')}</div></details>` : link(item,path)).join('');
}
export function renewalPresentation(page: KoreaPage): PagePresentation {
  const field = (values: Record<string,string>, key: string) => values[key] ?? page.fields.find(f=>f.key===key)?.value ?? '';
  return {
    bodyClass: 'korea-renewal',
    head: '<link rel="preload" href="/fonts/FigtreeVariable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/renewal.css?v=1"><script src="/renewal.js?v=1" defer></script>',
    header: (legacy, items, path) => {
      const logo = legacy.match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1] || '';
      return `<a class="rn-skip" href="#rn-main">본문 바로가기</a><header class="rn-header"><div class="rn-header-inner"><a href="/" class="rn-logo" aria-label="바야다코리아 홈">${logo?`<img src="${logo}" width="150" height="56" alt="바야다코리아">`:'BAYADA<span>.</span>'}</a><nav id="rn-navigation" class="rn-navigation" aria-label="주 메뉴">${navigation(items,path)}</nav><a class="rn-button rn-primary rn-header-cta" href="${consultation}">상담 신청</a><button type="button" class="rn-menu-toggle" aria-label="메뉴 열기" aria-expanded="false" aria-controls="rn-navigation"><span></span><span></span></button></div></header>`;
    },
    footer: legacy => `<footer class="rn-footer"><div class="rn-footer-brand rn-container"><span>BAYADA<span>.</span></span><p>Home Health Care</p></div>${legacy}</footer>`,
    content: page.path === '/' ? (_legacy,values) => {
      const f = (key: string) => e(field(values,key)); const u = (key: string) => href(field(values,key), page.fields.find(f=>f.key===key)?.kind === 'image');
      let video = '';
      try { const url=new URL(field(values,'f36')); if(url.protocol==='https:'&&['player.vimeo.com','www.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)){url.searchParams.set('autoplay','0');video=`<section class="rn-video rn-container rn-section"><div><p class="rn-overline">바야다의 이야기</p><h2>돌봄을 넘어,<br>일상의 동반자로.</h2></div><iframe src="${href(url.toString())}" title="${f('f37')}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></section>`;} } catch {}
      const cards = [
        {top:'f13',title:'f14',url:'f31',description:'전문 간호사가 직접 방문해 필요한 간호를 제공합니다.',kind:'nursing'},
        {top:'f16',title:'f17',url:'f33',description:'익숙한 집에서 편안한 일상을 이어가도록 돕습니다.',kind:'care'},
        {top:'f19',title:'f20',url:'f35',description:'개인의 상태와 생활에 맞춘 케어 프로그램을 만나보세요.',kind:'health'},
      ];
      const icons:Record<string,string>={nursing:'<path d="M12 5v14M5 12h14"/>',care:'<path d="m3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7"/>',health:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'};
      return `{{KOREA_HEADER}}<main id="rn-main" class="rn-home" tabindex="-1"><section class="rn-hero rn-container"><div class="rn-hero-copy"><p class="rn-hero-label">BAYADA HOME HEALTH CARE</p><h1>${f('f0')}<br>${f('f1')}</h1><p class="rn-lead">${f('f7')}<br>가장 편안한 곳, 나의 집에서 시작하세요.</p><div class="rn-hero-actions"><a class="rn-button rn-primary" href="${u('f41')}">${f('f25')}${arrow}</a><a class="rn-text-link" href="${u('f26')}">${f('f2')}</a></div><div class="rn-hero-caption"><span class="rn-status-dot"></span><span>나에게 맞는 돌봄, 바야다와 함께</span></div></div><div class="rn-hero-visual"><div class="rn-hero-ring" aria-hidden="true"></div><img class="rn-hero-person" src="${u('f27')}" alt="바야다 전문 케어 스태프" fetchpriority="high" width="622" height="700"><div class="rn-hero-note"><span class="rn-note-icon" aria-hidden="true">${arrow}</span><div><strong>${f('f3')}</strong><span>당신의 일상에 함께합니다.</span></div></div></div></section><section class="rn-services rn-section" id="services"><div class="rn-container"><div class="rn-section-heading"><div><p class="rn-overline">바야다의 케어</p><h2>필요한 돌봄을, 나의 일상에.</h2></div><p>${f('f9')}</p></div><div class="rn-service-grid">${cards.map(c=>`<a class="rn-service-card" href="${u(c.url)}"><span class="rn-service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[c.kind]}</svg></span><span class="rn-service-kicker">${f(c.top)}</span><h3>${f(c.title)}</h3><p>${e(c.description)}</p><span class="rn-card-action">자세히 보기${arrow}</span></a>`).join('')}</div></div></section><section class="rn-section rn-about"><div class="rn-container rn-about-grid"><div><p class="rn-overline">함께하는 전문성</p><h2>${f('f5')}<br>일상의 안심을 만듭니다.</h2><p>${f('f6')}<br>${f('f7')}</p><p>${f('f8')}<br>${f('f9')}</p><a class="rn-button rn-secondary" href="/aboutus/">바야다 소개${arrow}</a></div><a class="rn-philosophy" href="${u('f29')}"><p>${f('f10')}</p><h3>The BAYADA Way</h3><img src="${u('f28')}" alt="${f('f11')}" width="180" height="180" loading="lazy"><span>${f('f11')}${arrow}</span></a></div></section>${video}<section class="rn-partners rn-section"><div class="rn-container"><div class="rn-section-heading"><div><p class="rn-overline">함께 더 나은 돌봄으로</p><h2>${f('f4')}</h2></div><p>바야다와 함께하는 기관을 소개합니다.</p></div><div class="rn-partner-grid">{{KOREA_PARTNERS}}</div></div></section><section class="rn-contact rn-container"><div><p class="rn-overline">${f('f22')}</p><h2>어떤 도움이 필요하신가요?</h2><p>필요한 서비스와 궁금한 내용을 편하게 남겨 주세요.</p></div><div><a class="rn-button rn-primary" href="${u('f41')}">${f('f25')}${arrow}</a><a class="rn-contact-phone" href="${u('f39')}"><span>${f('f23')}</span><strong>${f('f24')}</strong></a></div></section></main>{{KOREA_FOOTER}}`;
    } : (html) => html.replace('{{KOREA_HEADER}}', '{{KOREA_HEADER}}<main id="rn-main" class="rn-content" tabindex="-1">').replace('{{KOREA_FOOTER}}','</main>{{KOREA_FOOTER}}'),
  };
}
