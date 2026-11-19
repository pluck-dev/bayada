"""Build a PHP-free public template/asset bundle from an anonymous capture.

Only referenced upload files are copied; the SQL backup and private submissions
must never be placed in the public directory. Run after capturing via Oinzi.
"""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit, parse_qsl, urlencode, urljoin

from bs4 import BeautifulSoup, NavigableString, Comment
import tinycss2

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = re.compile(r'https?://(?:www\.)?bayadakorea\.com', re.I)
PROXY = re.compile(r'https?://i[0-3]\.wp\.com/(?:www\.)?bayadakorea\.com', re.I)
CDN = re.compile(r'https?://c0\.wp\.com/c/[^/]+', re.I)
SAFE_EXT = {'.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.mp4', '.webm', '.pdf', '.hwp', '.hwpx', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'}
ASSET_ROOTS = {'/wp-content/uploads/': '/assets/media/', '/wp-content/plugins/': '/assets/vendor/', '/wp-content/themes/': '/assets/theme/', '/wp-includes/': '/assets/runtime/'}


def clean_asset_paths(text):
    for old, new in ASSET_ROOTS.items():
        text = text.replace('sourceURL=' + old, 'sourceURL=' + new)
        text = re.sub(r'(?<![\w.:/\\?=&%~-])' + re.escape(old), lambda _: new, text)
        text = re.sub(r'(?<![\w.:/\\?=&%~-])' + re.escape(old.replace('/', r'\/')), lambda _: new.replace('/', r'\/'), text)
        for escaped in [False, True]:
            old_base, new_base = old.rstrip('/'), new.rstrip('/')
            if escaped: old_base, new_base = old_base.replace('/', r'\/'), new_base.replace('/', r'\/')
            text = re.sub(r'(?<![\w.:/\\?=&%~-])' + re.escape(old_base) + r'''(?=$|[?#"'\s<>)]|\\["'])''', lambda _: new_base, text)
    def query(match):
        params = [(k, v) for k, v in parse_qsl(match[2].replace('&amp;', '&'), keep_blank_values=True) if k not in ['fit', 'resize', 'ssl', 'w', 'h', 'quality', 'strip']]
        encoded = urlencode(params)
        if '&amp;' in match[2]: encoded = encoded.replace('&', '&amp;')
        return match[1] + ('?' + encoded if encoded else '')
    return re.sub(r'''(/assets/[^\s"'<>\\)?]+)\?([^\s"'<>\\)#]*)''', query, text)


def clean_asset_data(value):
    if isinstance(value, str): return clean_asset_paths(value)
    if isinstance(value, list): return [clean_asset_data(v) for v in value]
    if isinstance(value, dict): return {k: clean_asset_data(v) for k, v in value.items()}
    return value


def localize(text):
    text = re.sub(r'https?:\\/\\/i[0-3]\.wp\.com\\/(?:www\.)?bayadakorea\.com', '', text)
    text = text.replace(r'https:\/\/www.bayadakorea.com', '').replace(r'http:\/\/www.bayadakorea.com', '')
    return CDN.sub('', ORIGIN.sub('', PROXY.sub('', text)))


def board_template(board):
    soup = BeautifulSoup(localize(str(board)), 'html.parser')
    for node in soup.select('script, input[type="hidden"]'):
        node.decompose()
    for node in soup.find_all(True):
        for attr in list(node.attrs):
            if attr.startswith('on'):
                del node[attr]
        if node.name == 'a' and str(node.get('href', '')).startswith('javascript:'):
            node['href'] = '#'
    body = soup.select_one('[id$="_board_body"]')
    gallery = soup.select_one('.gallery-item-box')
    if gallery:
        row = BeautifulSoup(str(gallery), 'html.parser')
        for anchor in row.select('.gallery-title a, .gallery-item-img a'):
            anchor['href'] = '?vid={{ID}}'
            anchor['title'] = '{{TITLE}}'
        row.select_one('.gallery-title a').clear()
        row.select_one('.gallery-title a').append(NavigableString('{{TITLE}}'))
        row.select_one('.gallery-item-img .img')['style'] = "max-width:100%;width:100%;height:220px;margin:0 auto;background-image:url('{{IMAGE}}');background-position:center center;background-size:cover;background-repeat:no-repeat;"
        spans = row.select('.gallery-date span')
        for index, marker in [(0, '{{DATE}}'), (-1, '{{HITS}}')]:
            spans[index].clear(); spans[index].append(NavigableString(marker))
        author = row.select_one('.gallery-name a')
        author.clear(); author.append(NavigableString('{{AUTHOR}}')); author['title'] = '{{AUTHOR}}'
    else:
        number_header = soup.select_one('.table-list thead th')
        if number_header:
            number_header['class'] = list(dict.fromkeys(number_header.get('class', []) + ['mb-th-pid', 'mb-hide-mobile', 'mb-hide-tablet']))
        row = BeautifulSoup(str(body.select_one('tr')), 'html.parser')
        row.tr['class'] = '{{ROW_CLASS}}'
        row.tr['id'] = 'mb-row-{{ID}}'
        cells = row.select('tr > td')
        for index, marker in [(0, '{{RANK}}'), (2, '{{AUTHOR}}'), (3, '{{DATE}}'), (4, '{{HITS}}')]:
            cells[index].clear(); cells[index].append(NavigableString(marker))
        cells[1].clear()
        anchor = row.new_tag('a', href='?vid={{ID}}')
        anchor['title'] = '{{TITLE}}'; anchor.append(BeautifulSoup('<span><span class="{{TITLE_CLASS}}">{{TITLE}}</span> {{ICON}}</span>', 'html.parser')); cells[1].append(anchor)
        cells[2].clear(); cells[2].append(BeautifulSoup('<span><a class="btn-user-info" href="?search_field=fn_user_name&amp;search_text={{AUTHOR_ENCODED}}"><span>{{AUTHOR}}</span></a> <img class="user-i-level mb-level-10" alt="Level 10" src="/wp-content/plugins/mangboard/skins/bbs_basic/images/icon_level10.gif"></span>', 'html.parser'))
    body.clear(); body.append(NavigableString('{{ROWS}}'))
    pager = soup.select_one('table.table-page')
    if pager:
        pager.clear(); pager.append(NavigableString('{{PAGER}}'))
    for form in soup.select('form[id$="_form_board_search"]'):
        form['method'] = 'get'; form['action'] = ''
        field = form.select_one('input[name="search_text"]')
        if field: field['value'] = '{{SEARCH}}'
        for anchor in form.select('a, button, input[type="button"]'):
            anchor['data-korea-search-submit'] = 'true'
    return {'list': str(soup), 'row': str(row), 'gallery': bool(gallery)}


def background_rules(css, conditions=()):
    for rule in tinycss2.parse_stylesheet(css, skip_comments=True, skip_whitespace=True):
        if rule.type == 'at-rule' and rule.content is not None and rule.lower_at_keyword in ['media', 'supports', 'container']:
            condition = '@' + rule.lower_at_keyword + ' ' + tinycss2.serialize(rule.prelude).strip()
            yield from background_rules(tinycss2.serialize(rule.content), (*conditions, condition))
        elif rule.type == 'qualified-rule':
            for declaration in tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True):
                if declaration.type != 'declaration' or declaration.lower_name != 'background-image':
                    continue
                value = tinycss2.serialize(declaration.value)
                match = re.fullmatch(r'\s*url\(["\']?([^\)"\']+)["\']?\)\s*', value)
                if match:
                    selector = tinycss2.serialize(rule.prelude).strip()
                    body = selector + '{background-image:url("{{KOREA_URL}}") !important;}'
                    for condition in reversed(conditions):
                        body = condition + '{' + body + '}'
                    yield match.group(1), body


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--capture', type=Path, default=ROOT / 'output/korea-capture')
    parser.add_argument('--backup', type=Path, default=ROOT / 'output/backups/bayadakorea/2026-11-19')
    parser.add_argument('--include-uncategorized-posts', action='store_true', help='Only after explicit review of legacy unrelated/spam-like posts')
    args = parser.parse_args()
    public = ROOT / 'apps/korea/public'
    content = ROOT / 'packages/korea/content'
    public.mkdir(parents=True, exist_ok=True)
    content.mkdir(parents=True, exist_ok=True)
    archives = {}
    for group in ['plugins', 'themes', 'uploads']:
        z = zipfile.ZipFile(next(args.backup.glob('*-' + group + '.zip')))
        for entry in z.infolist():
            if '..' in Path(entry.filename).parts or Path(entry.filename).is_absolute():
                raise RuntimeError('Unsafe source archive path')
            if not entry.is_dir() and Path(entry.filename).suffix.lower() in SAFE_EXT:
                archives['/wp-content/' + group + '/' + entry.filename] = (z, entry)
    wanted = set()

    def assets(text):
        for old, new in ASSET_ROOTS.items(): text = text.replace(new, old)
        for match in re.findall(r'(?:https?://[^\s"\'<>\\)]+|/(?:wp-content|wp-includes)/[^\s"\'<>\\)]+)', localize(text).replace(r'\/', '/')):
            try:
                path = unquote(urlsplit(match.replace('&amp;', '&')).path)
            except ValueError:
                continue  # JavaScript string templates are not concrete asset URLs.
            if '${' in path or '..' in Path(path).parts:
                continue
            if path.startswith(('/wp-content/', '/wp-includes/')) and Path(path).suffix.lower() in SAFE_EXT:
                wanted.add(path)

    def fields_for(markup):
        soup = BeautifulSoup(markup, 'html.parser')
        fields = []

        def token(kind, value, label):
            key = 'f' + str(len(fields))
            fields.append({'key': key, 'kind': kind, 'value': value, 'label': label[:90]})
            return '{{KOREA_FIELD:' + key + '}}'

        for node in list(soup.find_all(string=True)):
            if isinstance(node, NavigableString) and not isinstance(node, Comment) and node.parent.name not in ['script', 'style'] and node.strip() and not str(node).startswith('{{KOREA_'):
                if node.parent.name in ['title']:
                    continue
                node.replace_with(token('text', str(node), node.strip()))
        for element in soup.find_all(True):
            if element.name in ['script', 'link', 'style']:
                continue
            for attr in ['src', 'poster', 'alt', 'title', 'href']:
                value = element.get(attr)
                if value and isinstance(value, str) and not value.startswith(('#', 'javascript:', 'data:')):
                    kind = 'link' if attr == 'href' else 'image' if attr in ['src', 'poster'] else 'text'
                    element[attr] = token(kind, value, element.get('alt') or element.get('aria-label') or value)
                    if attr == 'src' and element.name == 'img' and element.get('srcset'):
                        fields[-1]['srcset'] = element['srcset']
                        element['srcset'] = '{{KOREA_SRCSET:' + fields[-1]['key'] + '}}'
        return {'template': str(soup), 'fields': fields}

    source = [json.loads(p.read_text(encoding='utf-8')) for p in sorted(args.capture.glob('page-*.json')) + sorted(args.capture.glob('post-*.json')) if re.match(r'^(page|post)-\d+\.json$', p.name)]
    categories_path = args.capture / 'post-categories.json'
    if not categories_path.exists():
        raise RuntimeError('Public post category inventory is missing; refusing an unreviewed publication import.')
    categories = json.loads(categories_path.read_text(encoding='utf-8'))
    categorized_ids = {post['id'] for category in categories if category['termId'] != 1 for post in category['posts']}
    quarantined = [item for item in source if item['kind'] == 'post' and item['legacyId'] not in categorized_ids and not args.include_uncategorized_posts]
    source = [item for item in source if item not in quarantined]
    archive_sources = [json.loads(p.read_text(encoding='utf-8')) for p in sorted(args.capture.glob('archive-*.json'))]
    category_sources = [p for p in archive_sources if p['id'] != 'archive-author-1']
    source.extend(category_sources)
    author_source = next((p for p in archive_sources if p['id'] == 'archive-author-1'), None)
    if author_source:
        cards = {}
        for item in category_sources:
            for article in BeautifulSoup(item['html'], 'html.parser').select('main article[id^="post-"]'):
                cards[article['id']] = str(article)
        allowed = {item['id'] for item in source if item['kind'] == 'post'}
        cards = [card for key, card in cards.items() if key in allowed]
        cards.sort(key=lambda card: BeautifulSoup(card, 'html.parser').select_one('time').get('datetime', ''), reverse=True)
        count = (len(cards) + 5) // 6
        for index in range(count):
            soup = BeautifulSoup(author_source['html'], 'html.parser')
            main = soup.select_one('main')
            for node in main.select('article, nav.posts-navigation'):
                node.decompose()
            for card in cards[index * 6:(index + 1) * 6]:
                main.append(BeautifulSoup(card, 'html.parser'))
            links = ''
            if index + 1 < count:
                links += f'<div class="nav-previous"><a href="/author/bayada2018/page/{index + 2}/">이전 글</a></div>'
            if index:
                links += f'<div class="nav-next"><a href="/author/bayada2018/{"page/" + str(index) + "/" if index > 1 else ""}">다음 글</a></div>'
            main.append(BeautifulSoup('<nav class="navigation posts-navigation" aria-label="글"><h2 class="screen-reader-text">글 탐색</h2><div class="nav-links">' + links + '</div></nav>', 'html.parser'))
            path = '/author/bayada2018/' + (f'page/{index + 1}/' if index else '')
            source.append({**author_source, 'id': f'archive-author-{index + 1}', 'path': path, 'html': str(soup)})
    (content / 'quarantine.json').write_text(json.dumps([{'legacyId': x['legacyId'], 'path': unquote(x['path']), 'title': x['title'], 'reason': '미분류 원본 글: 광고성·무관한 자료 포함. 공개 이관 검토 대기.'} for x in quarantined], ensure_ascii=False, indent=2), encoding='utf-8')
    home = next(x for x in source if x['path'] == '/')
    fragments = {}
    navigation = []
    partners = []
    partner_row = ''
    board_templates = {}
    faq_row = ''
    documents = []
    for item in source:
        if item['status'] != 200:
            raise RuntimeError('Public source failed: ' + item['id'])
        soup = BeautifulSoup(localize(item['html']), 'html.parser')
        # Captures can contain Owl's desktop-sized runtime wrappers. Restore its
        # input markup so the public script calculates widths for the new viewport.
        for carousel in soup.select('.owl-carousel'):
            stage = carousel.select_one(':scope > .owl-stage-outer > .owl-stage')
            if not stage: continue
            slides = []
            for slide in stage.find_all('div', class_='owl-item', recursive=False):
                if 'cloned' not in slide.get('class', []):
                    slides.extend(child.extract() for child in list(slide.contents))
            carousel.clear()
            for slide in slides: carousel.append(slide)
            carousel['class'] = [name for name in carousel.get('class', []) if name not in ['owl-loaded', 'owl-hidden', 'owl-drag', 'owl-refresh', 'owl-grab']]
        for element in soup.select('#wpadminbar, link[rel="https://api.w.org/"], link[rel="EditURI"], link[rel="pingback"], link[rel="shortlink"], link[rel="preconnect"]'):
            element.decompose()
        for element in soup.select('meta[name="generator"], link[rel="alternate"], link[rel="canonical"]'):
            element.decompose()
        for script in list(soup.find_all('script')):
            sid = script.get('id', '')
            src = script.get('src', '')
            keep = sid in ['jquery-core-js', 'jquery-migrate-js', 'jquery-ui-core-js', 'wp-hooks-js', 'wp-i18n-js', 'smartmenus-js', 'bayadakorea-navigation-js', 'jquery-owl-carousel-js', 'psacp-public-script-js', 'psacp-public-script-js-extra'] or sid.startswith(('elementor-webpack-', 'elementor-frontend-', 'elementor-pro-webpack-', 'elementor-pro-frontend-', 'pro-elements-handlers-'))
            inline = script.string or ''
            if not src and ('lazyloadRunObserver' in inline or sid in ['elementor-frontend-js-before', 'elementor-pro-frontend-js-before', 'jquery-ui-core-js-before']):
                keep = True
                script.string = re.sub(r'"nonce"\s*:\s*"[^"]*"', '"nonce":""', inline)
                script.string = re.sub(r'"nonces"\s*:\s*\{[^}]*\}', '"nonces":{}', script.string)
            if not keep:
                script.decompose()
        for node in soup.find_all(True):
            for attr in list(node.attrs):
                if attr.lower().startswith(('on', 'data-oinzi-')):
                    del node[attr]
            if node.name == 'a' and str(node.get('href', '')).startswith('javascript:'):
                node['href'] = '#'
            if node.name == 'input' and ('nonce' in node.get('name', '') or node.get('name', '').startswith('_wp')):
                node.decompose()
        for form in soup.select('form.wpcf7-form'):
            form['data-korea-inquiry'] = 'true'
            form['data-korea-form'] = 'CAREERS' if item['legacyId'] == 233 else 'CONSULTATION'
            form['action'] = '/api/inquiries'
            for hidden in form.select('input[type="hidden"]'):
                hidden.decompose()
            for field in form.select('[aria-required="true"]'):
                field['required'] = ''
            # Explicit consent is collected in the replacement form handler.
            consent = BeautifulSoup('<p><label><input name="privacyConsent" type="checkbox" required> 개인정보 수집·이용에 동의합니다.</label></p><input name="website" tabindex="-1" autocomplete="off" style="display:none"><p role="status" data-korea-result></p>', 'html.parser')
            form.append(consent)
        carousel = soup.select_one('.psacp-post-carousel-wrap.logo-list')
        if carousel:
            assets(str(carousel))
            if item['path'] == '/':
                for index, slide in enumerate(carousel.select('.psacp-post-slide')):
                    image, anchor = slide.find('img'), slide.find('a')
                    if image and anchor:
                        match = re.search(r'psacp-post-(\d+)', ' '.join(slide.get('class', [])))
                        partners.append({'id': match.group(1) if match else str(index), 'label': image.get('alt') or anchor.get_text(strip=True), 'href': anchor.get('href') or '/', 'image': image.get('src'), 'newTab': anchor.get('target') == '_blank'})
                row = BeautifulSoup(str(carousel.select_one('.psacp-post-slide')), 'html.parser')
                for anchor in row.find_all('a'):
                    anchor['href'] = '{{HREF}}'
                    if not anchor.find('img'):
                        anchor.clear(); anchor.append(NavigableString('{{LABEL}}'))
                image = row.find('img'); image['src'] = '{{IMAGE}}'; image['alt'] = '{{LABEL}}'
                partner_row = str(row)
            carousel.clear(); carousel.append(NavigableString('{{KOREA_PARTNERS}}'))
        for selector, key in [('.elementor-location-header', 'header'), ('.elementor-location-footer', 'footer')]:
            fragment = soup.select_one(selector)
            if fragment:
                if item['path'] == '/':
                    if key == 'header':
                        def menu_items(ul, prefix='menu'):
                            items = []
                            for li in ul.find_all('li', recursive=False):
                                anchor = li.find('a', recursive=False)
                                if anchor:
                                    nested = li.find('ul', recursive=False)
                                    identifier = li.get('id', prefix + '-' + str(len(items)))
                                    items.append({'id': identifier, 'label': anchor.get_text(strip=True), 'href': anchor.get('href') or '/', 'children': menu_items(nested, identifier) if nested else [], **({'newTab': True} if anchor.get('target') == '_blank' else {})})
                            return items
                        main_menu = fragment.select_one('.elementor-nav-menu--main > ul')
                        if main_menu:
                            navigation = menu_items(main_menu)
                        for ul in fragment.select('.elementor-nav-menu--main > ul, .elementor-nav-menu--dropdown > ul'):
                            ul.clear()
                            ul.append(NavigableString('{{KOREA_MENU}}'))
                    fragments[key] = fields_for(str(fragment))
                fragment.replace_with(NavigableString('{{KOREA_' + key.upper() + '}}'))
        board = soup.select_one('.mb-board[id$="_board"]')
        board_key = None
        if board:
            board_key = board.get('id', '').removesuffix('_board')
            assets(str(board))
            board_templates[board_key] = board_template(board)
            board.replace_with(NavigableString('{{KOREA_BOARD}}'))
        if item['legacyId'] == 554:
            accordion = soup.select_one('.elementor-accordion')
            if accordion:
                entries = accordion.select('.elementor-accordion-item')
                posts_file = content / 'boards.json'
                posts = [p for p in json.loads(posts_file.read_text(encoding='utf-8')) if p['board'] != 'bayadab_05']
                for index, entry in enumerate(entries):
                    posts.append({'id': '1' if index == 7 else f'faq-{index + 1}', 'board': 'bayadab_05', 'title': entry.select_one('.elementor-accordion-title').get_text(strip=True), 'content': entry.select_one('.elementor-tab-content').decode_contents(), 'author': '관리자', 'date': '2019-01-22', 'published': True, 'notice': False, 'image': '', 'sortOrder': index + 1, 'attachments': []})
                posts_file.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding='utf-8')
                row = BeautifulSoup(str(entries[0]), 'html.parser')
                for node in row.find_all(True):
                    for attr in ['id', 'aria-controls', 'aria-labelledby']:
                        if node.get(attr): node[attr] = re.sub(r'1221', '{{INDEX}}', node[attr])
                    if node.get('data-tab'): node['data-tab'] = '{{INDEX}}'
                row.select_one('.elementor-accordion-title').clear(); row.select_one('.elementor-accordion-title').append(NavigableString('{{TITLE}}'))
                row.select_one('.elementor-tab-content').clear(); row.select_one('.elementor-tab-content').append(NavigableString('{{CONTENT}}'))
                faq_row = str(row)
                accordion.clear(); accordion.append(NavigableString('{{KOREA_FAQ}}'))
                board_key = 'bayadab_05'
        if item['kind'] == 'archive':
            for article in soup.select('main article[id^="post-"]'):
                article['data-korea-origin'] = article['id']
        assets(str(soup))
        # Keep original execution order/position. Script nodes are never CMS fields.
        body = fields_for(soup.body.decode_contents())
        documents.append({'key': item['id'], 'path': unquote(item['path']), 'title': soup.title.get_text() if soup.title else item['title'], 'kind': item['kind'], 'legacyId': item['legacyId'], 'board': board_key, 'head': soup.head.decode_contents(), 'bodyClass': ' '.join(soup.body.get('class', [])), **body})
    for fragment in fragments.values():
        assets(fragment['template'])
        for field in fragment['fields']:
            assets(field['value'])
    board_file = content / 'boards.json'
    if board_file.exists():
        assets(board_file.read_text(encoding='utf-8').replace('\\/', '/'))
    # Elementor loads these public frontend chunks on demand (no PHP is copied).
    for path in archives:
        if re.match(r'/wp-content/plugins/elementor(?:-pro)?/assets/(?:js|lib/swiper)/', path) and Path(path).suffix in ['.js', '.css']:
            wanted.add(path)
    copied = set()
    missing = set()
    while wanted - copied - missing:
        path = next(iter(wanted - copied - missing))
        target = public / path.lstrip('/')
        if path not in archives:
            if target.is_file():
                copied.add(path)
                if target.suffix in ['.css', '.js']:
                    cached = target.read_text(encoding='utf-8', errors='replace')
                    assets(cached)
                    for ref in re.findall(r'url\(["\']?([^\)"\']+)', cached):
                        assets(urljoin('https://assets.local' + path, ref))
            else:
                missing.add(path)
            continue
        z, entry = archives[path]
        data = z.read(entry)
        if target.suffix in ['.css', '.js']:
            text = localize(data.decode('utf-8', errors='replace'))
            for ref in re.findall(r'url\(["\']?([^\)"\']+)', text):
                from posixpath import normpath, dirname
                resolved = normpath(dirname(path) + '/' + ref) if not ref.startswith(('/', 'http', 'data:')) else ref
                assets(resolved)
            assets(text)
            data = text.encode('utf-8')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        copied.add(path)
    for document in documents:
        styles = BeautifulSoup(document['head'], 'html.parser').select('link[rel="stylesheet"]')
        extra_styles = []
        for link in styles:
            css_path = urlsplit(link.get('href', '')).path
            if not css_path.startswith('/wp-content/uploads/elementor/css/post-') or any(css_path.endswith('post-' + key + '.css') for key in ['1516', '2665', '3245']):
                continue
            css_file = public / css_path.lstrip('/')
            if not css_file.exists():
                continue
            css = css_file.read_text(encoding='utf-8', errors='replace')
            for image, css_rule in background_rules(css):
                if not image.startswith(('/', 'https://', 'http://')):
                    continue
                key = 'f' + str(len(document['fields']))
                document['fields'].append({'key': key, 'kind': 'background', 'value': image, 'label': '배경 이미지 · ' + image.rsplit('/', 1)[-1], 'cssRule': css_rule})
                extra_styles.append('{{KOREA_BACKGROUND:' + key + '}}')
        if extra_styles:
            document['template'] += '<style>' + ''.join(extra_styles) + '</style>'
    detail_path = args.capture / 'board-notice.json'
    if detail_path.exists():
        detail = BeautifulSoup(localize(json.loads(detail_path.read_text(encoding='utf-8'))['html']), 'html.parser').select_one('table.table-view')
        if detail:
            cells = detail.select('tbody > tr')
            title_cell = cells[0].find('td')
            title_cell.clear(); title_cell.append(BeautifulSoup('<span style="float:left;">{{TITLE}}</span><span style="float:right;width:155px;text-align:right;">{{DATE}}</span>', 'html.parser'))
            author = cells[1].find('td'); author.clear(); author.append(NavigableString('{{AUTHOR}}'))
            body_cell = detail.select_one('.content-box'); body_cell.clear(); body_cell.append(NavigableString('{{CONTENT}}'))
            detail_template = str(detail)
        else: detail_template = ''
    else: detail_template = ''
    by_key = {p['key']: p for p in documents}
    for page in documents:
        if page['kind'] != 'archive': continue
        page['origins'] = re.findall(r'data-korea-origin="([^"]+)"', page['template'])
        candidates = {}
        for key in page['origins']:
            for field in by_key.get(key, {}).get('fields', []):
                if field['kind'] in ['image', 'background'] or (field['kind'] == 'text' and (len(field['value'].strip()) >= 10 or field['value'].strip() == by_key[key]['title'].split(' | ')[0])):
                    candidates.setdefault((field['kind'], field['value']), []).append({'key': key, 'field': field['key']})
        for field in page['fields']:
            matches = candidates.get((field['kind'], field['value']), [])
            if len(matches) == 1: field['source'] = matches[0]
    bundle = {'source': 'https://www.bayadakorea.com', 'pages': documents, 'fragments': fragments, 'navigation': navigation, 'partners': partners, 'partnerRow': partner_row, 'boards': board_templates, 'boardView': detail_template, 'faqRow': faq_row}
    (content / 'templates.json').write_text(json.dumps(clean_asset_data(bundle), ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    posts_file = content / 'boards.json'
    posts_file.write_text(json.dumps(clean_asset_data(json.loads(posts_file.read_text(encoding='utf-8'))), ensure_ascii=False, indent=2), encoding='utf-8')
    exported = []
    for old_path in sorted(copied):
        new_path = clean_asset_paths(old_path)
        old_file, new_file = public / old_path.lstrip('/'), public / new_path.lstrip('/')
        data = old_file.read_bytes()
        if old_file.suffix in ['.css', '.js']:
            text = data.decode('utf-8')
            if old_file.suffix == '.css':
                def css_url(match):
                    ref = match[2]
                    if ref.startswith(('data:', '#', 'http:', 'https:')): return match[0]
                    absolute = urljoin('https://assets.local' + old_path, ref)
                    parsed = urlsplit(absolute)
                    local = clean_asset_paths(parsed.path + ('?' + parsed.query if parsed.query else '') + ('#' + parsed.fragment if parsed.fragment else ''))
                    return 'url(' + match[1] + local + match[1] + ')'
                text = re.sub(r'''url\(\s*(["']?)([^)"']+)\1\s*\)''', css_url, text)
            data = clean_asset_paths(text).encode('utf-8')
        new_file.parent.mkdir(parents=True, exist_ok=True)
        new_file.write_bytes(data)
        exported.append(new_path)
    manifest = [{'path': path, 'bytes': (public / path.lstrip('/')).stat().st_size, 'sha256': hashlib.sha256((public / path.lstrip('/')).read_bytes()).hexdigest()} for path in exported]
    (content / 'assets-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    (args.capture / 'missing-assets.json').write_text(json.dumps(sorted(missing), ensure_ascii=False, indent=2), encoding='utf-8')
    report = {'pages': len(documents), 'fields': sum(len(x['fields']) for x in documents), 'assetsCopied': len(copied), 'missingAssets': sorted(missing), 'bundleSha256': hashlib.sha256((content / 'templates.json').read_bytes()).hexdigest()}
    (args.capture / 'bundle-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'missingAssets'}), 'missing:', len(missing))


if __name__ == '__main__':
    main()
