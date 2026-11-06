# Converts Figma Dev Mode React+Tailwind into a TSX module plus plain CSS, flexing fixed widths so frames reflow.
"""Converts Figma Dev Mode React+Tailwind into a TSX module plus plain CSS.

Fixed widths flex and fixed heights become minimums, so wide frames can reflow.
Frames with absolute layout come out with no height, so write those by hand.
Hand-written rules belong after the generated ones, and regenerating overwrites the file.
"""
import argparse, re, os, json, hashlib, urllib.request
CACHE = {}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('frames', nargs='+', help='Name=path: a component name and a saved get_design_context file')
parser.add_argument('--tsx', required=True, help='Output TSX file')
parser.add_argument('--css', required=True, help='Output CSS file, imported by the TSX')
parser.add_argument('--assets', required=True, help='Folder under public/ for downloaded images')
parser.add_argument('--public', default='public', help='The public folder')
args = parser.parse_args()
FRAMES = dict(item.split('=', 1) for item in args.frames)
BIG = 100
unknown = set()

def px(v):
    return v.replace('_', ' ')

def decl(c, parent_row, in_abs):
    m = re.fullmatch(r'\[([a-z-]+):(.+)\]', c)
    if m:
        return {} if m.group(1) == 'word-break' and False else {m.group(1): px(m.group(2))}
    simple = {
        'content-stretch': {'align-content': 'stretch'}, 'flex': {'display': 'flex'}, 'flex-col': {'flex-direction': 'column'}, 'items-center': {'align-items': 'center'}, 'items-start': {'align-items': 'flex-start'}, 'items-end': {'align-items': 'flex-end'},
        'justify-center': {'justify-content': 'center'}, 'justify-between': {'justify-content': 'space-between'}, 'justify-end': {'justify-content': 'flex-end'}, 'shrink-0': {'flex-shrink': '0'}, 'grow': {'flex-grow': '1'}, 'self-stretch': {'align-self': 'stretch'}, 'relative': {'position': 'relative'}, 'absolute': {'position': 'absolute'},
        'size-full': {'width': '100%', 'height': '100%'}, 'w-full': {'width': '100%'}, 'h-full': {'height': '100%'}, 'w-px': {'width': '1px'}, 'h-px': {'height': '1px'}, 'min-w-px': {'min-width': '1px'}, 'min-h-px': {'min-height': '1px'}, 'min-w-full': {'min-width': '100%'}, 'max-w-none': {'max-width': 'none'}, 'block': {'display': 'block'},
        'bg-white': {'background-color': 'var(--cs-surface)'}, 'text-white': {'color': '#fff'}, 'text-center': {'text-align': 'center'}, 'text-right': {'text-align': 'right'}, 'not-italic': {}, 'font-normal': {'font-weight': '400'}, 'font-medium': {'font-weight': '500'}, 'font-semibold': {'font-weight': '600'}, 'font-bold': {'font-weight': '700'},
        'border': {'border-width': '1px'}, 'border-0': {'border-width': '0'}, 'border-2': {'border-width': '2px'}, 'border-solid': {'border-style': 'solid'}, 'border-t': {'border-top-width': '1px'}, 'border-b': {'border-bottom-width': '1px'}, 'border-l': {'border-left-width': '1px'}, 'border-r': {'border-right-width': '1px'},
        'inset-0': {'inset': '0'}, 'left-0': {'left': '0'}, 'right-0': {'right': '0'}, 'top-0': {'top': '0'}, 'top-px': {'top': '1px'}, 'bottom-1/2': {'bottom': '50%'}, '-translate-x-full': {'transform': 'translateX(-100%)'}, 'mb-0': {'margin-bottom': '0'}, 'pt-px': {'padding-top': '1px'}, 'overflow-clip': {'overflow': 'clip'},
        'underline': {'text-decoration-line': 'underline'}, 'decoration-solid': {'text-decoration-style': 'solid'}, 'decoration-from-font': {'text-decoration-thickness': 'from-font'}, 'whitespace-nowrap': {'white-space': 'nowrap'}, 'whitespace-pre': {'white-space': 'pre'}, 'whitespace-pre-wrap': {'white-space': 'pre-wrap'}, 'flex-[1_0_0]': {'flex': '1 0 0'},
    }
    if c in simple:
        return simple[c]
    m = re.fullmatch(r'opacity-(\d+)', c)
    if m:
        return {'opacity': str(int(m.group(1)) / 100)}
    m = re.fullmatch(r'([a-z-]+?)-\[(.+)\]', c)
    if not m:
        unknown.add(c); return {}
    k, v = m.group(1), px(m.group(2))
    if k == 'font':
        return {}
    if k == 'text':
        return {'color': v} if v.startswith(('#', 'rgb', 'var')) else {'font-size': v}
    if k == 'bg':
        return {'background-color': v}
    if k == 'leading': return {'line-height': v}
    if k == 'tracking': return {'letter-spacing': v}
    if k == 'shadow': return {'box-shadow': v}
    if k == 'size': return {'width': v, 'height': v}
    if k == 'w':
        n = re.fullmatch(r'([\d.]+)px', v)
        if n and float(n.group(1)) >= BIG and not in_abs:
            return {'flex': '1 1 0', 'min-width': '0'} if parent_row else {'width': '100%'}
        return {'width': v}
    if k == 'border':
        return {'border-color': v} if v.startswith(('#', 'rgb', 'var')) else {'border-width': v}
    props = {'h': ['height'], 'min-w': ['min-width'], 'min-h': ['min-height'], 'max-w': ['max-width'], 'p': ['padding'], 'px': ['padding-left', 'padding-right'], 'py': ['padding-top', 'padding-bottom'], 'pt': ['padding-top'], 'pb': ['padding-bottom'], 'pl': ['padding-left'], 'pr': ['padding-right'], 'gap': ['gap'], 'gap-x': ['column-gap'], 'gap-y': ['row-gap'], 'rounded': ['border-radius'], 'rounded-tl': ['border-top-left-radius'], 'rounded-tr': ['border-top-right-radius'], 'rounded-bl': ['border-bottom-left-radius'], 'rounded-br': ['border-bottom-right-radius'], 'left': ['left'], 'right': ['right'], 'top': ['top'], 'bottom': ['bottom'], 'inset': ['inset'], 'border-t': ['border-top-width'], 'border-b': ['border-bottom-width'], 'border-l': ['border-left-width'], 'border-r': ['border-right-width'], 'opacity': ['opacity'], 'mb': ['margin-bottom'], 'mt': ['margin-top'], 'ml': ['margin-left'], 'mr': ['margin-right']}
    if k in props:
        return {p: v for p in props[k]}
    unknown.add(c); return {}

rules = {}
ROWS = set()
COUNT = [0]
def cls_for(d):
    body = ';'.join(f'{k}:{v}' for k, v in d.items())
    if body not in rules:
        rules[body] = f'fg-{hashlib.md5(body.encode()).hexdigest()[:6]}'
    return rules[body]

asset_dir = os.path.join(args.public, args.assets)
os.makedirs(asset_dir, exist_ok=True)
assets = {}
def fetch(url):
    if url in assets: return assets[url]
    cached = CACHE.get(url)
    if cached: assets[url] = cached; return cached
    data = urllib.request.urlopen(url, timeout=15).read()
    ext = 'svg' if data.lstrip()[:4] in (b'<svg', b'<?xm') else 'png'
    name = hashlib.md5(data).hexdigest()[:10] + '.' + ext
    open(os.path.join(asset_dir, name), 'wb').write(data)
    assets[url] = '/' + args.assets.replace(os.sep, '/').strip('/') + '/' + name
    CACHE[url] = assets[url]
    return assets[url]

out = ["/* Generated from Figma \"Portfolio 2026\" through Dev Mode; widths flex so wide frames fit the case study column. */", f"import './{os.path.basename(args.css)}'", '']
for name, path in FRAMES.items():
    fid = os.path.basename(path).split('.')[0]
    s = open(path, encoding='utf-8').read()
    consts = dict(re.findall(r'^const (\w+) = "(http[^"]+)"', s, re.M))
    a = s.index('return (', s.index('export default')); b = s.index('\n  );\n}', a)
    jsx = s[a + len('return ('):b]
    # Walk tags to learn each element's parent direction.
    stack = []
    def rep(m):
        full = m.group(0); closing = m.group(1); tag = m.group(2); attrs = m.group(3); selfc = m.group(4)
        if closing:
            if stack:
                e = stack.pop()
                if e.get('n') is not None and e['cols'] >= 2: ROWS.add(e['n'])
            return full
        cm = re.search(r'className="([^"]*)"', attrs)
        classes = cm.group(1).split() if cm else []
        parent = stack[-1] if stack else {'row': False, 'abs': False}
        abs_ = parent['abs'] or 'absolute' in classes
        d = {}
        for c in classes:
            d.update(decl(c, parent['row'], abs_))
        if not stack and d.get('height') == '100%': d.pop('height')
        if stack and d.get('overflow') == 'clip': d.pop('overflow')
        hm = re.fullmatch(r'([\d.]+)px', d.get('height', ''))
        if hm and float(hm.group(1)) >= 28 and not abs_ and d.get('width') != d.get('height'):
            d['min-height'] = d.pop('height')
        if 'flex' in classes and 'flex-col' not in classes: row = True
        else: row = False
        if stack and (d.get('flex', '').startswith('1')): stack[-1]['cols'] = stack[-1].get('cols', 0) + 1
        n = None
        if row:
            COUNT[0] += 1; n = COUNT[0]
        attrs2 = re.sub(r'\s*data-(node-id|name)="[^"]*"', '', attrs)
        if cm:
            attrs2 = re.sub(r'className="[^"]*"', (f'className="{cls_for(d)}' + (f' @@{n}@@' if n else '') + '"') if d else '', attrs2)
        if not selfc: stack.append({'row': row, 'abs': abs_, 'n': n, 'cols': 0})
        return f'<{tag}{attrs2}{"/" if selfc else ""}>'
    jsx = re.sub(r'<(/?)([A-Za-z][\w]*)((?:\s+[^<>]*?)?)(/?)>', rep, jsx)
    def src(m):
        return f'src="{fetch(consts[m.group(1)])}"'
    jsx = re.sub(r'src=\{(\w+)\}', src, jsx)
    jsx = re.sub(r'className="([^"]*)"', lambda m: f'className="{m.group(1)} fg-frame-{name}"', jsx, count=1)
    out += [f'/** Figma {fid.replace("-", ":")} */', f'export function {name}() {{', '  return (', jsx.rstrip(), '  )', '}', '']
code = re.sub(r' ?@@(\d+)@@', lambda m: ' fg-row' if int(m.group(1)) in ROWS else '', '\n'.join(out))
open(args.tsx, 'w', encoding='utf-8').write(code)
css = ['/* Generated from Figma "Portfolio 2026" through Dev Mode. */', '.cs-system [class^="fg-"] { box-sizing: border-box; border-width: 0; }']
for body, c in rules.items():
    css.append(f'.cs-system .{c} {{ {body} }}')
css += ['', '.cs-system [class^="fg-"] { box-sizing: border-box; }', '.cs-system img[class^="fg-"] { max-width: none; }']
open(args.css, 'w', encoding='utf-8').write('\n'.join(css) + '\n')
print('rules', len(rules), 'assets', len(assets), 'unknown', sorted(unknown))
