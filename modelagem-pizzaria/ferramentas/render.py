"""Desenha um Diagram.xml do Bizagi em SVG (prévia para conferência visual e para o relatório)."""
import math, html
from xpdl import q, local
from edit import _kind

FONT = "Liberation Sans, Arial, sans-serif"


def _f(v):
    return float(v)


def _ngi(e):
    n = e.find(q('NodeGraphicsInfos'))
    return None if n is None else n.find(q('NodeGraphicsInfo'))


def _box(e):
    g = _ngi(e)
    c = g.find(q('Coordinates'))
    return _f(c.get('XCoordinate')), _f(c.get('YCoordinate')), _f(g.get('Width')), _f(g.get('Height'))


def _pts(e):
    cgi = e.find(q('ConnectorGraphicsInfos')).find(q('ConnectorGraphicsInfo'))
    return [(_f(c.get('XCoordinate')), _f(c.get('YCoordinate'))) for c in cgi.findall(q('Coordinates'))], cgi


def wrap(text, width_px, size):
    words = (text or '').replace('\xa0', ' ').split()
    maxc = max(4, int(width_px / (size * 0.52)))
    lines, cur = [], ''
    for w in words:
        if len(cur) + len(w) + (1 if cur else 0) <= maxc:
            cur = (cur + ' ' + w).strip()
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def text_block(x, y, w, h, text, size=11, valign='middle', weight='normal', color='#1a1a1a'):
    lines = wrap(text, w, size)
    lh = size * 1.18
    total = lh * len(lines)
    if valign == 'middle':
        y0 = y + (h - total) / 2 + size * 0.9
    else:
        y0 = y + size * 0.9
    out = []
    for i, ln in enumerate(lines):
        out.append('<text x="%.1f" y="%.1f" font-size="%s" font-family="%s" font-weight="%s" fill="%s" text-anchor="middle">%s</text>'
                   % (x + w / 2, y0 + i * lh, size, FONT, weight, color, html.escape(ln)))
    return '\n'.join(out)


def envelope(cx, cy, s, filled):
    w, h = s * 1.4, s
    x, y = cx - w / 2, cy - h / 2
    fill = '#333' if filled else 'none'
    stroke = '#fff' if filled else '#333'
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" stroke="#333" stroke-width="1.2"/>'
            '<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="1.2"/>'
            % (x, y, w, h, fill, x, y, cx, cy + 1, x + w, y, stroke))


def clock(cx, cy, r):
    s = '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff" stroke="#333" stroke-width="1.2"/>' % (cx, cy, r)
    for i in range(12):
        a = i * math.pi / 6
        s += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="0.8"/>' % (
            cx + r * 0.75 * math.cos(a), cy + r * 0.75 * math.sin(a), cx + r * math.cos(a), cy + r * math.sin(a))
    s += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="1.2"/>' % (cx, cy, cx, cy - r * 0.6)
    s += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="1.2"/>' % (cx, cy, cx + r * 0.45, cy)
    return s


def cond_icon(cx, cy, s):
    x, y = cx - s * 0.45, cy - s * 0.55
    out = '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#fff" stroke="#333" stroke-width="1.1"/>' % (x, y, s * 0.9, s * 1.1)
    for i in range(4):
        yy = y + s * 0.2 + i * s * 0.23
        out += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="1"/>' % (x + s * 0.15, yy, x + s * 0.75, yy)
    return out


def link_icon(cx, cy, s, filled):
    pts = [(-0.5, -0.2), (0.1, -0.2), (0.1, -0.45), (0.55, 0), (0.1, 0.45), (0.1, 0.2), (-0.5, 0.2)]
    p = ' '.join('%.1f,%.1f' % (cx + a * s, cy + b * s) for a, b in pts)
    return '<polygon points="%s" fill="%s" stroke="#333" stroke-width="1.1"/>' % (p, '#333' if filled else '#fff')


def render(diag_root, title=None, scale=1.0):
    els = []
    xs, ys = [], []

    def ext(x, y, w=0, h=0):
        xs.extend([x, x + w]); ys.extend([y, y + h])

    # pools e raias
    for p in diag_root.iter(q('Pool')):
        if p.get('BoundaryVisible') != 'true':
            continue
        x, y, w, h = _box(p)
        ext(x, y, w, h)
        els.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#fff" stroke="#222" stroke-width="1.4"/>' % (x, y, w, h))
        lanes = list(p.find(q('Lanes')))
        band = 25
        els.append('<rect x="%.1f" y="%.1f" width="%d" height="%.1f" fill="#eef2f7" stroke="#222" stroke-width="1.4"/>' % (x, y, band, h))
        els.append('<text transform="translate(%.1f,%.1f) rotate(-90)" font-size="13" font-weight="bold" font-family="%s" text-anchor="middle">%s</text>'
                   % (x + band / 2 + 5, y + h / 2, FONT, html.escape((p.get('Name') or '').replace('\xa0', ' ').strip())))
        for ln in lanes:
            lg = _ngi(ln)
            lc = lg.find(q('Coordinates'))
            ly = y + _f(lc.get('YCoordinate')); lh = _f(lg.get('Height'))
            els.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="#555" stroke-width="1"/>' % (x + band, ly, w - band, lh))
            els.append('<rect x="%.1f" y="%.1f" width="%d" height="%.1f" fill="#f6f8fb" stroke="#555" stroke-width="1"/>' % (x + band, ly, band, lh))
            els.append('<text transform="translate(%.1f,%.1f) rotate(-90)" font-size="11.5" font-family="%s" text-anchor="middle">%s</text>'
                       % (x + band * 1.5 + 4, ly + lh / 2, FONT, html.escape(ln.get('Name') or '')))

    acts = list(diag_root.iter(q('Activity')))
    # subprocesso expandido (atividade com BlockActivity) desenhado primeiro
    for a in acts:
        k = _kind(a)
        x, y, w, h = _box(a)
        ext(x, y, w, h)
        name = (a.get('Name') or '').replace('\xa0', ' ').strip()
        cx, cy = x + w / 2, y + h / 2
        if k.startswith('task') or k == 'call' or k == 'other':
            dash = ''
            els.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="9" fill="#e8f1fb" stroke="#1f4e8c" stroke-width="%s"%s/>'
                       % (x, y, w, h, '2.6' if k == 'call' else '1.3', dash))
            if a.find(q('BlockActivity')) is not None:
                els.append(text_block(x, y + 4, w, 20, name, 11, 'top'))
            else:
                els.append(text_block(x + 4, y + 2, w - 8, h - 6, name, 11))
            ic = k.split('-')[1] if '-' in k else ''
            tag = {'User': 'usuário', 'Manual': 'manual', 'Send': 'envio', 'Receive': 'recebimento', 'Service': 'serviço'}.get(ic)
            if tag:
                els.append('<text x="%.1f" y="%.1f" font-size="8" font-family="%s" fill="#1f4e8c">%s</text>' % (x + 5, y + 10, FONT, tag))
            if k == 'call':
                els.append('<rect x="%.1f" y="%.1f" width="12" height="12" fill="#fff" stroke="#1f4e8c"/>' % (cx - 6, y + h - 14))
                els.append('<path d="M%.1f %.1f h8 M%.1f %.1f v8" stroke="#1f4e8c" stroke-width="1.3"/>' % (cx - 4, y + h - 8, cx, y + h - 12))
            lp = a.find(q('Loop'))
            if lp is not None and lp.get('LoopType') == 'Standard':
                els.append('<path d="M%.1f %.1f a5 5 0 1 1 4 -1" fill="none" stroke="#1f4e8c" stroke-width="1.4"/>' % (cx - 3, y + h - 5))
        elif k.startswith('gw'):
            r = w / 2
            els.append('<polygon points="%.1f,%.1f %.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="#fffbe0" stroke="#8a6d00" stroke-width="1.4"/>'
                       % (cx, y, x + w, cy, cx, y + h, x, cy))
            route = a.find(q('Route'))
            gt = route.get('GatewayType', 'Exclusive')
            if route.get('ExclusiveType') == 'Event':
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="#333" stroke-width="1"/>' % (cx, cy, r * 0.55))
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="#333" stroke-width="1"/>' % (cx, cy, r * 0.45))
                pts = []
                for i in range(5):
                    ang = -math.pi / 2 + i * 2 * math.pi / 5
                    pts.append('%.1f,%.1f' % (cx + r * 0.3 * math.cos(ang), cy + r * 0.3 * math.sin(ang)))
                els.append('<polygon points="%s" fill="none" stroke="#333" stroke-width="1.1"/>' % ' '.join(pts))
            elif gt == 'Parallel':
                els.append('<path d="M%.1f %.1f v%.1f M%.1f %.1f h%.1f" stroke="#222" stroke-width="3.2"/>' % (cx, cy - r * 0.5, r, cx - r * 0.5, cy, r))
            elif gt == 'Inclusive':
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="#222" stroke-width="2.6"/>' % (cx, cy, r * 0.42))
            else:
                d = r * 0.36
                els.append('<path d="M%.1f %.1f L%.1f %.1f M%.1f %.1f L%.1f %.1f" stroke="#222" stroke-width="3.2"/>' % (cx - d, cy - d, cx + d, cy + d, cx + d, cy - d, cx - d, cy + d))
            g = _ngi(a)
            if name and g.get('TextX') is not None:
                els.append(text_block(_f(g.get('TextX')), _f(g.get('TextY')), _f(g.get('TextWidth')), _f(g.get('TextHeight')), name, 10.5, 'middle', 'normal', '#5a4500'))
                ext(_f(g.get('TextX')), _f(g.get('TextY')), _f(g.get('TextWidth')), _f(g.get('TextHeight')))
        else:
            r = w / 2
            base = k.split('-')[0]
            trig = k.split('-')[1] if '-' in k else 'None'
            if base == 'start':
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#eaf7e6" stroke="#2e7d32" stroke-width="1.6"/>' % (cx, cy, r))
            elif base == 'end':
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fdeaea" stroke="#b71c1c" stroke-width="3.6"/>' % (cx, cy, r - 1))
            else:
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff8e1" stroke="#8a6d00" stroke-width="1.3"/>' % (cx, cy, r))
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="#8a6d00" stroke-width="1.3"/>' % (cx, cy, r - 3.5))
            throw = base == 'end' or (base == 'link' and trig == 'THROW')
            if trig == 'Message':
                els.append(envelope(cx, cy, r * 0.62, base == 'end'))
            elif trig == 'Timer':
                els.append(clock(cx, cy, r * 0.62))
            elif trig == 'Conditional':
                els.append(cond_icon(cx, cy, r * 0.9))
            elif base == 'link':
                els.append(link_icon(cx, cy, r * 0.9, trig == 'THROW'))
            elif trig == 'Terminate':
                els.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#222"/>' % (cx, cy, r * 0.55))
            g = _ngi(a)
            if name and g.get('TextX') is not None:
                els.append(text_block(_f(g.get('TextX')), _f(g.get('TextY')), _f(g.get('TextWidth')), _f(g.get('TextHeight')), name, 10.5, 'top'))
                ext(_f(g.get('TextX')), _f(g.get('TextY')), _f(g.get('TextWidth')), _f(g.get('TextHeight')))
    # dados
    for d in list(diag_root.iter(q('DataObject'))):
        x, y, w, h = _box(d); ext(x, y, w, h)
        els.append('<path d="M%.1f %.1f h%.1f l8 8 v%.1f h-%.1f z" fill="#f4f4f4" stroke="#555"/>' % (x, y, w - 8, h - 8, w))
        g = _ngi(d)
        els.append(text_block(x - 40, y + h + 2, w + 80, 30, d.get('Name') or '', 9.5, 'top', 'normal', '#444'))
    names = {}
    for ds in diag_root.iter(q('DataStore')):
        names[ds.get('Id')] = ds.get('Name')
    for d in list(diag_root.iter(q('DataStoreReference'))):
        x, y, w, h = _box(d); ext(x, y, w, h)
        els.append('<path d="M%.1f %.1f v%.1f a%.1f 5 0 0 0 %.1f 0 v-%.1f" fill="#f4f4f4" stroke="#555"/>' % (x, y + 5, h - 10, w / 2, w, h - 10))
        els.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="5" fill="#f4f4f4" stroke="#555"/>' % (x + w / 2, y + 5, w / 2))
        els.append(text_block(x - 40, y + h + 2, w + 80, 30, names.get(d.get('DataStoreRef'), ''), 9.5, 'top', 'normal', '#444'))
    for a in diag_root.iter(q('Artifact')):
        x, y, w, h = _box(a); ext(x, y, w, h)
        els.append('<path d="M%.1f %.1f h-10 v%.1f h10" fill="none" stroke="#777" stroke-width="1.2"/>' % (x + 10, y, h))
        els.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#fafafa" stroke="none"/>' % (x + 2, y + 1, w - 4, h - 2))
        els.append(text_block(x + 4, y + 2, w - 8, h - 4, a.get('TextAnnotation') or '', 9.5, 'middle', 'normal', '#444'))

    # conectores
    for t in diag_root.iter(q('Transition')):
        pts, cgi = _pts(t)
        if len(pts) < 2:
            continue
        for p in pts:
            ext(p[0], p[1])
        els.append('<polyline points="%s" fill="none" stroke="#222" stroke-width="1.3" marker-end="url(#arr)"/>' % ' '.join('%.1f,%.1f' % p for p in pts))
        if t.get('Name'):
            tx, ty = _f(cgi.get('TextX', pts[0][0])), _f(cgi.get('TextY', pts[0][1]))
            tw, th = _f(cgi.get('TextWidth', 90)), _f(cgi.get('TextHeight', 23))
            els.append(text_block(tx, ty, tw, th, t.get('Name'), 10, 'middle', 'normal', '#0d3a78'))
    for m in diag_root.iter(q('MessageFlow')):
        pts, cgi = _pts(m)
        if len(pts) < 2:
            continue
        els.append('<polyline points="%s" fill="none" stroke="#555" stroke-width="1.2" stroke-dasharray="6 4" marker-start="url(#mstart)" marker-end="url(#marr)"/>' % ' '.join('%.1f,%.1f' % p for p in pts))
        if m.get('Name'):
            tx, ty = _f(cgi.get('TextX', pts[0][0])), _f(cgi.get('TextY', pts[0][1]))
            els.append(text_block(tx, ty, _f(cgi.get('TextWidth', 90)), _f(cgi.get('TextHeight', 23)), m.get('Name'), 9.5, 'middle', 'normal', '#555'))
    for s in diag_root.iter(q('Association')):
        pts, cgi = _pts(s)
        els.append('<polyline points="%s" fill="none" stroke="#777" stroke-width="1" stroke-dasharray="2 3"/>' % ' '.join('%.1f,%.1f' % p for p in pts))

    minx, miny = min(xs) - 20, min(ys) - 20
    maxx, maxy = max(xs) + 20, max(ys) + 20
    W, H = maxx - minx, maxy - miny
    head = ''
    if title:
        head = '<text x="%.1f" y="%.1f" font-size="15" font-weight="bold" font-family="%s" fill="#222">%s</text>' % (minx + 4, miny - 6, FONT, html.escape(title))
        miny -= 30; H += 30
    defs = ('<defs>'
            '<marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#222"/></marker>'
            '<marker id="marr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff" stroke="#555"/></marker>'
            '<marker id="mstart" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7"><circle cx="5" cy="5" r="4" fill="#fff" stroke="#555"/></marker>'
            '</defs>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f" width="%.0f" height="%.0f">%s'
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#fff"/>%s\n%s</svg>'
            % (minx, miny, W, H, W * scale, H * scale, defs, minx, miny, W, H, head, '\n'.join(els)))
