"""Camada de edição sobre o XPDL do Bizagi: clona elementos-modelo do próprio
arquivo original, para que tudo que for criado siga a estrutura que o Bizagi grava."""
import copy, glob, os
import xml.etree.ElementTree as ET
from xpdl import parse, serialize, q, local, new_id, XSI

# pasta com o .bpm original extraído (um subdiretório x/<id do diagrama> por diagrama); gerar.py a preenche
BPM_DIR = os.environ['PIZZARIA_BPM_DIR']
ORIG = os.path.join(BPM_DIR, 'x')

# ---------------------------------------------------------------- modelos
_T = {}


def _kind(a):
    ev = a.find(q('Event'))
    if ev is not None:
        c = list(ev)[0]
        k = local(c.tag)
        trig = c.get('Trigger') or c.get('Result')
        if c.get('IsAttached') == 'true':
            return 'boundary-' + trig
        if trig == 'Link':
            return 'link-' + list(c)[0].get('CatchThrow', 'CATCH')
        if k == 'EndEvent' and trig == 'Message':
            return 'end-Message'
        return {'StartEvent': 'start', 'EndEvent': 'end', 'IntermediateEvent': 'inter'}[k] + '-' + trig
    r = a.find(q('Route'))
    if r is not None:
        return 'gw-' + r.get('GatewayType', 'Exclusive')
    im = a.find(q('Implementation'))
    if im is not None:
        t = im.find(q('Task'))
        if t is not None:
            ch = list(t)
            return 'task-' + (local(ch[0].tag)[4:] if ch else 'None')
        if im.find(q('SubFlow')) is not None:
            return 'call'
    return 'other'


def _load_templates():
    for f in sorted(glob.glob(ORIG + '/*/Diagram.xml')):
        r = parse(f)
        for a in r.iter(q('Activity')):
            k = _kind(a)
            # prefere modelos com RuntimeProperties preenchido de forma simples
            if k not in _T:
                _T[k] = copy.deepcopy(a)
        for tag in ('Transition', 'MessageFlow', 'Association', 'Artifact', 'DataObject', 'DataStoreReference', 'Lane'):
            for e in r.iter(q(tag)):
                key = tag
                if tag == 'Transition':
                    c = e.find(q('Condition'))
                    key = 'Transition-cond' if c is not None and c.get('Type') else 'Transition'
                    if e.get('Name') and key == 'Transition-cond':
                        key = 'Transition-cond'
                if key not in _T:
                    _T[key] = copy.deepcopy(e)


_load_templates()

COLORS = {
    'start': ('-10311914', '-1638505'), 'end': ('-6750208', '-1135958'), 'inter': ('-6909623', '-66833'),
    'task': ('-16553830', '-1249281'), 'gw': ('-5855715', '-52'),
}


def _fmt_block(size='8', bold='false', bg=True):
    f = ET.Element(q('Formatting'))
    for tag, val in (('Alignment', 'Center'), ('FontName', 'Segoe UI'), ('SizeFont', size), ('Bold', bold),
                     ('Italic', 'false'), ('Strikeout', 'false'), ('Underline', 'false'), ('ColorFont', '-16777216')):
        e = ET.SubElement(f, q(tag)); e.text = val
    td = ET.Element(q('TextDirection')); td.set('{%s}nil' % XSI, 'true')
    out = [f, td]
    if bg:
        b = ET.Element(q('TextBackgroundColor')); b.text = '16777215'; out.append(b)
    return out


class Diagram:
    def __init__(self, diag_id):
        self.id = diag_id
        self.dir = os.path.join(ORIG, diag_id)
        self.root = parse(os.path.join(self.dir, 'Diagram.xml'))

    # ------------------------------------------------------------ busca
    def pkg(self, tag):
        return self.root.find(q(tag))

    def ensure_pkg(self, tag, after):
        e = self.root.find(q(tag))
        if e is None:
            e = ET.Element(q(tag))
            kids = list(self.root)
            idx = max(kids.index(self.root.find(q(t))) for t in after if self.root.find(q(t))is not None) + 1
            self.root.insert(idx, e)
        return e

    def wps(self):
        return list(self.root.find(q('WorkflowProcesses')))

    def wp(self, pid):
        for w in self.wps():
            if w.get('Id') == pid:
                return w
        raise KeyError(pid)

    def main_wp(self):
        """Processo do pool visível que contém atividades."""
        for w in self.wps():
            if w.find(q('Activities')) is not None:
                return w
        raise KeyError('sem atividades')

    def all_acts(self):
        return list(self.root.iter(q('Activity')))

    def act(self, aid):
        for a in self.root.iter(q('Activity')):
            if a.get('Id') == aid or a.get('Id', '').startswith(aid):
                return a
        raise KeyError(aid)

    def full(self, aid):
        return self.act(aid).get('Id')

    def parent_of(self, el):
        for p in self.root.iter():
            for c in p:
                if c is el:
                    return p
        return None

    def ngi(self, el):
        return el.find(q('NodeGraphicsInfos')).find(q('NodeGraphicsInfo'))

    def geom(self, aid):
        a = self.act(aid)
        g = self.ngi(a)
        c = g.find(q('Coordinates'))
        return (float(c.get('XCoordinate')), float(c.get('YCoordinate')), float(g.get('Width')), float(g.get('Height')))

    # ------------------------------------------------------------ edição de nós
    def rename(self, aid, name):
        self.act(aid).set('Name', name)

    def set_doc(self, aid, text):
        a = self.act(aid)
        for tag in ('Description', 'Documentation'):
            e = a.find(q(tag))
            if e is not None:
                e.text = text

    def move(self, aid, x, y, w=None, h=None):
        a = self.act(aid)
        g = self.ngi(a)
        c = g.find(q('Coordinates'))
        c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        if w: g.set('Width', str(int(w)))
        if h: g.set('Height', str(int(h)))
        self._textbox(a)

    def _textbox(self, a, label='below'):
        g = self.ngi(a)
        c = g.find(q('Coordinates'))
        x, y = int(c.get('XCoordinate')), int(c.get('YCoordinate'))
        w, h = int(g.get('Width')), int(g.get('Height'))
        k = _kind(a)
        if k.startswith('task') or k == 'call' or k == 'other':
            box = (x, y, w, h)
        elif k.startswith('gw'):
            box = (x + w // 2 - 60, y - 36, 120, 34)
        else:
            box = (x + w // 2 - 60, y + h + 4, 120, 34)
        if a.get('_label') == 'above':
            box = (x + w // 2 - 60, y - 36, 120, 34)
        elif a.get('_label') == 'below':
            box = (x + w // 2 - 60, y + h + 4, 120, 34)
        elif a.get('_label') == 'right':
            box = (x + w + 2, y + h // 2 - 17, 120, 34)
        elif a.get('_label') == 'left':
            box = (x - 122, y + h // 2 - 17, 120, 34)
        elif a.get('_label') == 'aboveleft':
            box = (x - 104, y - 30, 120, 34)
        elif a.get('_label') == 'aboveright':
            box = (x + w - 16, y - 30, 120, 34)
        elif a.get('_label') == 'belowright':
            box = (x + w + 2, y + h - 6, 120, 34)
        g.set('TextX', str(box[0])); g.set('TextY', str(box[1]))
        g.set('TextWidth', str(box[2])); g.set('TextHeight', str(box[3]))

    def label_pos(self, aid, where):
        a = self.act(aid)
        a.set('_label', where)
        self._textbox(a)

    def label_box(self, aid, x, y, w, h):
        g = self.ngi(self.act(aid))
        g.set('TextX', str(int(x))); g.set('TextY', str(int(y)))
        g.set('TextWidth', str(int(w))); g.set('TextHeight', str(int(h)))

    def set_task_type(self, aid, kind):
        a = self.act(aid)
        t = a.find(q('Implementation')).find(q('Task'))
        for c in list(t):
            t.remove(c)
        if kind != 'None':
            e = ET.SubElement(t, q('Task' + kind))
            if kind == 'User':
                e.set('Implementation', 'Unspecified')
            if kind == 'Receive':
                e.set('Instantiate', 'false')

    def set_gateway(self, aid, gtype):
        r = self.act(aid).find(q('Route'))
        for k in list(r.attrib):
            del r.attrib[k]
        if gtype == 'EventBased':
            r.set('GatewayType', 'Exclusive'); r.set('ExclusiveType', 'Event')
        elif gtype != 'Exclusive':
            r.set('GatewayType', gtype)

    def delete(self, aid):
        a = self.act(aid)
        fid = a.get('Id')
        self.parent_of(a).remove(a)
        # remove conectores que apontam para o nó
        for tag in ('Transition', 'MessageFlow', 'Association'):
            for e in list(self.root.iter(q(tag))):
                ends = (e.get('From'), e.get('To'), e.get('Source'), e.get('Target'))
                if fid in ends:
                    self.parent_of(e).remove(e)

    def _new_act(self, kind, name, x, y, w, h, proc=None, container=None):
        t = copy.deepcopy(_T[kind])
        t.set('Id', new_id()); t.set('Name', name)
        for tag in ('Description', 'Documentation'):
            e = t.find(q(tag))
            if e is not None:
                e.text = None
        for m in t.iter(q('Message')):
            m.set('Id', new_id())
        for ex in t.iter(q('Expression')):
            ex.text = name
        lk = t.find('.//' + q('TriggerResultLink'))
        if lk is not None:
            lk.set('Name', name.replace(' ', '_x0020_'))
        g = self.ngi(t)
        c = g.find(q('Coordinates'))
        c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        g.set('Width', str(int(w))); g.set('Height', str(int(h)))
        base = kind.split('-')[0]
        col = COLORS.get({'call': 'task', 'boundary': 'inter', 'link': 'inter'}.get(base, base))
        if col:
            g.set('BorderColor', col[0]); g.set('FillColor', col[1])
        self._textbox(t)
        if container is None:
            w_ = self.wp(proc) if proc else self.main_wp()
            container = w_.find(q('Activities'))
        container.append(t)
        return t.get('Id')

    def task(self, name, x, y, kind='Manual', w=142, h=60, doc=None, **kw):
        aid = self._new_act('task-' + kind, name, x, y, w, h, **kw)
        if doc:
            self.set_doc(aid, doc)
        return aid

    def call(self, name, x, y, ref, w=142, h=60, **kw):
        aid = self._new_act('call', name, x, y, w, h, **kw)
        self.act(aid).find(q('Implementation')).find(q('SubFlow')).set('Id', ref)
        return aid

    def event(self, kind, name, x, y, label='below', **kw):
        """kind: start-None, start-Message, start-Timer, start-Conditional, end-None, end-Message,
        end-Terminate, inter-Timer, inter-Message, inter-Conditional, link-THROW, link-CATCH"""
        tk = kind
        if kind == 'link-CATCH':
            tk = 'link-THROW'
        aid = self._new_act(tk, name, x, y, 36, 36, **kw)
        a = self.act(aid)
        if kind == 'link-CATCH':
            a.find('.//' + q('TriggerResultLink')).set('CatchThrow', 'CATCH')
        if kind == 'inter-Conditional' and 'inter-Conditional' not in _T:
            pass
        self.label_pos(aid, label)
        return aid

    def boundary(self, name, host, x, y, label='below', **kw):
        aid = self._new_act('boundary-Message', name, x, y, 36, 36, **kw)
        ie = self.act(aid).find(q('Event')).find(q('IntermediateEvent'))
        ie.attrib.clear()
        ie.set('Trigger', 'Message'); ie.set('Target', self.full(host)); ie.set('IsAttached', 'true')
        self.label_pos(aid, label)
        return aid

    def attach(self, aid, host):
        ie = self.act(aid).find(q('Event')).find(q('IntermediateEvent'))
        trig = ie.get('Trigger')
        ie.attrib.clear()
        ie.set('Trigger', trig); ie.set('Target', self.full(host)); ie.set('IsAttached', 'true')

    def gateway(self, name, x, y, gtype='Exclusive', label='above', **kw):
        aid = self._new_act('gw-Exclusive', name, x, y, 42, 42, **kw)
        self.set_gateway(aid, gtype)
        self.label_pos(aid, label)
        return aid

    # ------------------------------------------------------------ conectores
    def port(self, aid, side):
        x, y, w, h = self.geom(aid)
        return {'R': (x + w, y + h / 2), 'L': (x, y + h / 2), 'T': (x + w / 2, y), 'B': (x + w / 2, y + h)}[side]

    def route(self, a, b, out='R', inn='L', via=None):
        p0, p1 = self.port(a, out), self.port(b, inn)
        pts = [p0]
        if via is not None:
            pts += via
        else:
            hz0, hz1 = out in 'RL', inn in 'RL'
            if hz0 and hz1:
                if abs(p0[1] - p1[1]) > 0.5:
                    mx = (p0[0] + p1[0]) / 2
                    pts += [(mx, p0[1]), (mx, p1[1])]
            elif hz0 and not hz1:
                pts += [(p1[0], p0[1])]
            elif not hz0 and hz1:
                pts += [(p0[0], p1[1])]
            else:
                if abs(p0[0] - p1[0]) > 0.5:
                    my = (p0[1] + p1[1]) / 2
                    pts += [(p0[0], my), (p1[0], my)]
        pts.append(p1)
        # remove pontos repetidos
        clean = [pts[0]]
        for p in pts[1:]:
            if abs(p[0] - clean[-1][0]) > 0.1 or abs(p[1] - clean[-1][1]) > 0.1:
                clean.append(p)
        return clean

    def _cgi_set_points(self, e, pts, name=None, label_at=None):
        cgi = e.find(q('ConnectorGraphicsInfos')).find(q('ConnectorGraphicsInfo'))
        for c in cgi.findall(q('Coordinates')):
            cgi.remove(c)
        for k in ('FromPort', 'ToPort'):
            cgi.attrib.pop(k, None)
        for (x, y) in pts:
            c = ET.SubElement(cgi, q('Coordinates'))
            c.set('XCoordinate', str(int(round(x)))); c.set('YCoordinate', str(int(round(y))))
        if name:
            if label_at is None:
                (x0, y0), (x1, y1) = pts[0], pts[1]
                if abs(y0 - y1) < 1:   # primeiro trecho horizontal: rótulo acima
                    label_at = ((x0 + x1) / 2 - 45, y0 - 22)
                else:                   # vertical: rótulo à direita
                    label_at = (x0 + 4, (y0 + y1) / 2 - 11)
            cgi.set('TextX', str(int(label_at[0]))); cgi.set('TextY', str(int(label_at[1])))
            cgi.set('TextWidth', '90'); cgi.set('TextHeight', '23')
        else:
            x0, y0 = pts[0]
            cgi.set('TextX', str(int(x0))); cgi.set('TextY', str(int(y0)))
            cgi.attrib.pop('TextWidth', None); cgi.attrib.pop('TextHeight', None)

    def flow(self, a, b, name=None, cond=None, out='R', inn='L', via=None, pts=None, proc=None, label_at=None, container=None):
        """cond: None = sem condição; True = CONDITION (saída de gateway de decisão)"""
        key = 'Transition-cond' if cond else 'Transition'
        e = copy.deepcopy(_T[key])
        e.set('Id', new_id())
        e.set('From', self.full(a)); e.set('To', self.full(b))
        e.attrib.pop('Name', None)
        if name:
            e.set('Name', name)
        if cond:
            ex = e.find(q('Condition')).find(q('Expression'))
            ex.text = cond if isinstance(cond, str) else None
        if pts is None:
            pts = self.route(a, b, out, inn, via)
        self._cgi_set_points(e, pts, name, label_at)
        if container is None:
            w = self.wp(proc) if proc else self.main_wp()
            trs = w.find(q('Transitions'))
            if trs is None:
                trs = ET.Element(q('Transitions'))
                kids = list(w)
                w.insert(kids.index(w.find(q('ExtendedAttributes'))), trs)
            container = trs
        container.append(e)
        # ordena atributos como o Bizagi (Id, From, To, Name)
        attrs = [(k, e.get(k)) for k in ('Id', 'From', 'To', 'Name') if e.get(k) is not None]
        e.attrib.clear()
        for k, v in attrs:
            e.set(k, v)
        return e.get('Id')

    def transitions(self):
        return list(self.root.iter(q('Transition')))

    def find_flow(self, a, b):
        fa, fb = self.full(a), self.full(b)
        for t in self.transitions():
            if t.get('From') == fa and t.get('To') == fb:
                return t
        raise KeyError((a, b))

    def del_flow(self, a, b):
        t = self.find_flow(a, b)
        self.parent_of(t).remove(t)

    def reroute(self, a, b, out='R', inn='L', via=None, pts=None, label_at=None):
        t = self.find_flow(a, b)
        if pts is None:
            pts = self.route(a, b, out, inn, via)
        self._cgi_set_points(t, pts, t.get('Name'), label_at)

    def relabel(self, a, b, name, cond=True):
        t = self.find_flow(a, b)
        t.set('Name', name)
        c = t.find(q('Condition'))
        if cond and not c.get('Type'):
            c.set('Type', 'CONDITION'); ET.SubElement(c, q('Expression'))

    def uncondition(self, a, b):
        t = self.find_flow(a, b)
        c = t.find(q('Condition'))
        c.attrib.clear()
        for k in list(c):
            c.remove(k)

    def clear_flows(self):
        for t in self.transitions():
            self.parent_of(t).remove(t)

    # mensagens, associações, artefatos
    def pool_by_name(self, name):
        for p in self.root.iter(q('Pool')):
            if p.get('Name') == name:
                return p
        raise KeyError(name)

    def msg(self, src, dst, name, pts):
        e = copy.deepcopy(_T['MessageFlow'])
        e.set('Id', new_id())
        e.attrib.pop('Name', None); e.attrib.pop('Source', None); e.attrib.pop('Target', None)
        attrs = [('Id', e.get('Id'))]
        if name:
            attrs.append(('Name', name))
        attrs += [('Source', src), ('Target', dst)]
        e.attrib.clear()
        for k, v in attrs:
            e.set(k, v)
        self._cgi_set_points(e, pts, name)
        mfs = self.ensure_pkg('MessageFlows', ['Pools'])
        mfs.append(e)
        return e.get('Id')

    def del_msgs(self, pred):
        for e in list(self.root.iter(q('MessageFlow'))):
            if pred(e):
                self.parent_of(e).remove(e)

    def assoc(self, src, dst, pts):
        e = copy.deepcopy(_T['Association'])
        e.set('Id', new_id()); e.set('Source', src); e.set('Target', dst)
        cgi = e.find(q('ConnectorGraphicsInfos')).find(q('ConnectorGraphicsInfo'))
        for c in cgi.findall(q('Coordinates')):
            cgi.remove(c)
        for (x, y) in pts:
            c = ET.SubElement(cgi, q('Coordinates'))
            c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        a = self.ensure_pkg('Associations', ['Pools', 'MessageFlows'])
        a.append(e)
        return e.get('Id')

    def annotation(self, text, x, y, w, h, anchor=None, pts=None):
        e = copy.deepcopy(_T['Artifact'])
        e.set('Id', new_id()); e.set('TextAnnotation', text)
        g = self.ngi(e)
        c = g.find(q('Coordinates'))
        c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        g.set('Width', str(int(w))); g.set('Height', str(int(h)))
        arts = self.ensure_pkg('Artifacts', ['Pools', 'MessageFlows', 'Associations'])
        arts.append(e)
        if anchor:
            self.assoc(self.full(anchor), e.get('Id'), pts)
        return e.get('Id')

    def move_node_el(self, el, x, y, w=None, h=None):
        g = self.ngi(el)
        c = g.find(q('Coordinates'))
        dx = int(x) - int(float(c.get('XCoordinate'))); dy = int(y) - int(float(c.get('YCoordinate')))
        c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        if w: g.set('Width', str(int(w)))
        if h: g.set('Height', str(int(h)))
        if g.get('TextX') is not None:
            g.set('TextX', str(int(float(g.get('TextX'))) + dx)); g.set('TextY', str(int(float(g.get('TextY'))) + dy))

    def byid(self, anyid):
        for e in self.root.iter():
            if e.get('Id') == anyid or (e.get('Id') or '').startswith(anyid):
                return e
        raise KeyError(anyid)

    # ------------------------------------------------------------ pools e raias
    def pool(self, pid):
        for p in self.root.iter(q('Pool')):
            if p.get('Id', '').startswith(pid) or p.get('Name') == pid:
                return p
        raise KeyError(pid)

    def set_pool(self, pid, x, y, w, h):
        p = self.pool(pid)
        g = self.ngi(p)
        c = g.find(q('Coordinates'))
        c.set('XCoordinate', str(int(x))); c.set('YCoordinate', str(int(y)))
        g.set('Width', str(int(w))); g.set('Height', str(int(h)))
        lanes = p.find(q('Lanes'))
        yy = 0
        for ln in lanes:
            lg = self.ngi(ln)
            lg.set('Width', str(int(w) - 50))
            lc = lg.find(q('Coordinates'))
            lc.set('XCoordinate', '50'); lc.set('YCoordinate', str(yy))
            if lg.get('TextX') is not None:
                lg.set('TextX', str(int(x) + 50)); lg.set('TextY', str(int(y) + yy))
                lg.set('TextWidth', str(int(w) - 50)); lg.set('TextHeight', lg.get('Height'))
            yy += int(float(lg.get('Height')))

    def set_lanes(self, pid, heights):
        """heights: lista (nome, altura) na ordem; cria raias novas quando o nome não existe."""
        p = self.pool(pid)
        lanes = p.find(q('Lanes'))
        existing = {ln.get('Name'): ln for ln in lanes}
        for ln in list(lanes):
            lanes.remove(ln)
        for name, hgt in heights:
            ln = existing.get(name)
            if ln is None:
                ln = copy.deepcopy(_T['Lane'])
                ln.set('Id', new_id()); ln.set('Name', name); ln.set('ParentPool', p.get('Id'))
            self.ngi(ln).set('Height', str(int(hgt)))
            lanes.append(ln)
        g = self.ngi(p)
        g.set('Height', str(int(sum(h for _, h in heights))))

    def lane_name(self, pid, old, new):
        for ln in self.pool(pid).find(q('Lanes')):
            if ln.get('Name') == old:
                ln.set('Name', new)

    def set_doc_pkg(self, text):
        ph = self.root.find(q('PackageHeader'))
        ph.find(q('Documentation')).text = text
        for w in self.wps():
            if w.find(q('Activities')) is not None:
                w.find(q('ProcessHeader')).find(q('Description')).text = text

    # ------------------------------------------------------------ saída
    def cleanup(self):
        for a in self.root.iter(q('Activity')):
            a.attrib.pop('_label', None)
            k = _kind(a)
            if a.get('Name') and (k.split('-')[0] in ('start', 'end', 'inter', 'link', 'boundary', 'gw')) \
                    and self.ngi(a).get('TextX') is None:
                self._textbox(a)
        # remove contêineres de conectores vazios que o Bizagi não grava vazios
        for tag in ('MessageFlows', 'Associations', 'Artifacts'):
            e = self.root.find(q(tag))
            if e is not None and len(e) == 0:
                self.root.remove(e)

    def xml(self):
        self.cleanup()
        return serialize(self.root)

    def element_ids(self):
        ids = []
        for tag in ('Activity', 'DataObject', 'DataStoreReference', 'Artifact'):
            for e in self.root.iter(q(tag)):
                ids.append(e.get('Id'))
        return ids
