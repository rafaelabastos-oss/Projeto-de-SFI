"""Checagens entre diagramas: referências de subprocesso e estados de fim tratados pelo processo pai."""
import glob, os, sys
from xpdl import parse, q
from edit import _kind


def load(base):
    ds = {}
    for f in sorted(glob.glob(base + '/*/Diagram.xml')):
        ds[f.split('/')[-2]] = parse(f)
    return ds


def run(base, whitelist_parents=('Cadeia de Valor da Pizzaria',)):
    ds = load(base)
    procs = {}
    for did, r in ds.items():
        for wp in r.find(q('WorkflowProcesses')):
            acts = wp.find(q('Activities'))
            if acts is None:
                continue
            ends = sorted({(a.get('Name') or '').strip() for a in acts if _kind(a).startswith('end')})
            procs[wp.get('Id')] = (r.get('Name'), ends)
    issues = []
    for did, r in ds.items():
        pname = r.get('Name')
        for wp in r.find(q('WorkflowProcesses')):
            acts = wp.find(q('Activities'))
            if acts is None:
                continue
            byid = {a.get('Id'): a for a in acts}
            outs = {}
            trs = wp.find(q('Transitions'))
            for t in (trs if trs is not None else []):
                outs.setdefault(t.get('From'), []).append(t.get('To'))
            for a in acts:
                sf = a.find(q('Implementation'))
                sf = sf.find(q('SubFlow')) if sf is not None else None
                if sf is None:
                    continue
                ref = sf.get('Id')
                nm = (a.get('Name') or '').strip()
                if ref not in procs:
                    issues.append('%s: subprocesso "%s" aponta para processo inexistente' % (pname, nm))
                    continue
                called, ends = procs[ref]
                if called.lower().replace(' ', '') != nm.lower().replace(' ', '') and nm.lower() not in called.lower():
                    issues.append('%s: subprocesso "%s" abre o diagrama "%s"' % (pname, nm, called))
                if len(ends) > 1 and pname not in whitelist_parents:
                    nxt = outs.get(a.get('Id'), [])
                    ok = len(nxt) == 1 and nxt[0] in byid and _kind(byid[nxt[0]]) == 'gw-Exclusive' \
                        and len(outs.get(nxt[0], [])) >= 2
                    if not ok:
                        issues.append('%s: "%s" termina em %d estados (%s), mas o processo pai segue sem decidir pelo estado'
                                      % (pname, nm, len(ends), '; '.join(ends)))
    return issues


if __name__ == '__main__':
    for i in run(sys.argv[1]):
        print(' -', i)
    print('fim')
