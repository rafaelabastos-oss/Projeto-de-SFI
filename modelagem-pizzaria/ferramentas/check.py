"""Verificação de solidez (soundness, van der Aalst) por jogo de tokens sobre cada processo.

Cada fluxo de sequência é um "lugar". Os nós consomem e produzem tokens conforme a
semântica BPMN: tarefa/evento (1 entra, 1 sai), XOR (escolhe 1 saída; na junção passa
cada token que chega), AND (espera todas as entradas; dispara todas as saídas),
OR (dispara um subconjunto não vazio; na junção espera enquanto algum token ainda pode
chegar a uma entrada — semântica não local), gateway de eventos (escolhe 1 evento).
Evento de borda interruptivo: a atividade vira "em execução" e pode terminar
normalmente ou ser interrompida pelo evento. Cada evento de início gera uma instância.

Relata: deadlock (tokens parados sem nada habilitado), falta de sincronização
(dois tokens no mesmo fluxo, ou fim alcançado com tokens sobrando), livelock
(estado a partir do qual o fim é inalcançável), nós mortos, nós sem entrada/saída
e caminhos que terminam sem evento de fim."""
import itertools
from xpdl import q, local
from edit import _kind


def graph(root, wp):
    acts = {}
    for a in wp.find(q('Activities')) if wp.find(q('Activities')) is not None else []:
        acts[a.get('Id')] = a
    flows = []
    trs = wp.find(q('Transitions'))
    for t in (trs if trs is not None else []):
        flows.append((t.get('Id'), t.get('From'), t.get('To')))
    return acts, flows


def analyse(root, wp, max_states=200000):
    acts, flows = graph(root, wp)
    issues = []
    name = lambda i: (acts[i].get('Name') or '').replace('\xa0', ' ').strip() or _kind(acts[i]) if i in acts else str(i)
    ins = {i: [] for i in acts}; outs = {i: [] for i in acts}
    for fid, a, b in flows:
        if a not in acts or b not in acts:
            issues.append('fluxo solto (origem ou destino inexistente): %s -> %s' % (name(a) if a else None, name(b) if b else None))
            continue
        outs[a].append(fid); ins[b].append(fid)
    frm = {fid: a for fid, a, b in flows}
    to = {fid: b for fid, a, b in flows}
    kinds = {i: _kind(a) for i, a in acts.items()}
    boundary = {}
    for i, a in acts.items():
        ie = a.find(q('Event'))
        if ie is not None:
            c = list(ie)[0]
            if c.get('IsAttached') == 'true':
                if c.get('Target') in acts:
                    boundary.setdefault(c.get('Target'), []).append(i)
                else:
                    issues.append('evento de borda "%s" não está anexado a nenhuma atividade' % name(i))
    # subprocesso de evento (BlockActivity de um ActivitySet disparado por evento) não tem fluxo de entrada/saída
    evsub = set()
    for aset in wp.iter(q('ActivitySet')):
        if aset.get('TriggeredByEvent') == 'true':
            for i, a in acts.items():
                ba = a.find(q('BlockActivity'))
                if ba is not None and ba.get('ActivitySetId') == aset.get('Id'):
                    evsub.add(i)
    for i in evsub:
        kinds[i] = 'eventsub'
    starts = [i for i, k in kinds.items() if k.startswith('start')]
    for i, k in kinds.items():
        if k.startswith('start') or k.startswith('boundary') or k == 'link-CATCH' or k == 'eventsub':
            if k.startswith('boundary') and not outs[i]:
                issues.append('evento de borda "%s" sem saída' % name(i))
            continue
        if not ins[i]:
            issues.append('nó sem fluxo de entrada: "%s"' % name(i))
    for i, k in kinds.items():
        if k.startswith('end') or k == 'link-THROW' or k == 'eventsub':
            continue
        if not outs[i]:
            issues.append('nó sem fluxo de saída (caminho sem desfecho): "%s"' % name(i))
        if len(outs[i]) > 1 and not k.startswith('gw'):
            issues.append('atividade "%s" com %d saídas sem gateway (divergência paralela implícita)' % (name(i), len(outs[i])))
        if len(ins[i]) > 1 and not k.startswith('gw'):
            issues.append('atividade "%s" com %d entradas sem gateway (junção implícita)' % (name(i), len(ins[i])))
    # links: throw -> catch do mesmo nome
    link_catch = {}
    for i, a in acts.items():
        if kinds[i] == 'link-CATCH':
            link_catch[a.find('.//' + q('TriggerResultLink')).get('Name')] = i
    for i, a in acts.items():
        if kinds[i] == 'link-THROW':
            nm = a.find('.//' + q('TriggerResultLink')).get('Name')
            if nm not in link_catch:
                issues.append('link lançador "%s" sem receptor correspondente (o token some)' % name(i))

    # ------------------------------ espaço de estados
    # estado: tupla ordenada de (lugar, n); lugares = fluxos + 'busy:<act>' para atividades com borda
    def succ(state):
        m = dict(state)
        res = []

        def mk(d):
            return tuple(sorted((k, v) for k, v in d.items() if v))

        for i, k in kinds.items():
            ii, oo = ins[i], outs[i]
            if i in boundary:
                # início da atividade
                for f in ii:
                    if m.get(f):
                        d = dict(m); d[f] -= 1; d['busy:' + i] = d.get('busy:' + i, 0) + 1
                        res.append(('%s (início)' % name(i), mk(d)))
                if m.get('busy:' + i):
                    for o in oo:
                        d = dict(m); d['busy:' + i] -= 1; d[o] = d.get(o, 0) + 1
                        res.append((name(i), mk(d)))
                    for b in boundary[i]:
                        for o in outs[b]:
                            d = dict(m); d['busy:' + i] -= 1; d[o] = d.get(o, 0) + 1
                            res.append((name(b), mk(d)))
                continue
            if k.startswith('boundary') or k.startswith('start') or k == 'eventsub':
                continue
            if k == 'link-CATCH':
                continue
            if k == 'link-THROW':
                nm = acts[i].find('.//' + q('TriggerResultLink')).get('Name')
                c = link_catch.get(nm)
                for f in ii:
                    if m.get(f):
                        d = dict(m); d[f] -= 1
                        if c:
                            for o in outs[c]:
                                d[o] = d.get(o, 0) + 1
                        res.append((name(i), mk(d)))
                continue
            if k.startswith('end'):
                for f in ii:
                    if m.get(f):
                        d = dict(m); d[f] -= 1
                        if k == 'end-Terminate':
                            d = {}
                        res.append((name(i), mk(d)))
                continue
            gt = k[3:] if k.startswith('gw') else None
            ev = k.startswith('gw') and acts[i].find(q('Route')).get('ExclusiveType') == 'Event'
            if gt is None or (gt == 'Exclusive'):
                # tarefa/evento/XOR: consome 1 de qualquer entrada; produz 1 em uma saída (XOR escolhe)
                for f in ii:
                    if m.get(f):
                        targets = oo if (gt == 'Exclusive' or len(oo) <= 1) else [None]
                        if gt is None and len(oo) > 1:
                            # divergência implícita: todas as saídas
                            d = dict(m); d[f] -= 1
                            for o in oo:
                                d[o] = d.get(o, 0) + 1
                            res.append((name(i), mk(d)))
                            continue
                        for o in targets:
                            d = dict(m); d[f] -= 1
                            if o:
                                d[o] = d.get(o, 0) + 1
                            res.append((name(i), mk(d)))
            elif gt == 'Parallel':
                if ii and all(m.get(f) for f in ii):
                    d = dict(m)
                    for f in ii:
                        d[f] -= 1
                    for o in oo:
                        d[o] = d.get(o, 0) + 1
                    res.append((name(i), mk(d)))
            elif gt == 'Inclusive':
                marked = [f for f in ii if m.get(f)]
                if not marked:
                    continue
                if len(ii) > 1:
                    # junção OR: espera se algum token em outro lugar ainda alcança uma entrada vazia
                    empty = [f for f in ii if not m.get(f)]
                    waiting = False
                    for p, n in m.items():
                        if not n or p in ii:
                            continue
                        start_node = to.get(p) if not p.startswith('busy:') else p[5:]
                        if start_node and reach_to(start_node, i, empty):
                            waiting = True; break
                    if waiting:
                        continue
                    d = dict(m)
                    for f in marked:
                        d[f] -= 1
                    subsets = [oo] if len(oo) == 1 else [c for r in range(1, len(oo) + 1) for c in itertools.combinations(oo, r)]
                    for sub in subsets:
                        dd = dict(d)
                        for o in sub:
                            dd[o] = dd.get(o, 0) + 1
                        res.append((name(i), mk(dd)))
                else:
                    for sub in [c for r in range(1, len(oo) + 1) for c in itertools.combinations(oo, r)]:
                        d = dict(m); d[ii[0]] -= 1
                        for o in sub:
                            d[o] = d.get(o, 0) + 1
                        res.append((name(i), mk(d)))
        return res

    # alcançabilidade no grafo (para junção OR)
    adj = {}
    for fid, a, b in flows:
        adj.setdefault(a, []).append((fid, b))
    for h, bs in boundary.items():
        for b in bs:
            adj.setdefault(h, []).extend((o, to[o]) for o in outs[b])

    def reach_to(node, join, empty):
        seen = set(); stack = [node]
        while stack:
            n = stack.pop()
            if n in seen or n == join:
                continue
            seen.add(n)
            for fid, b in adj.get(n, []):
                if b == join and fid in empty:
                    return True
                stack.append(b)
        return False

    fired = set()
    for s in starts:
        init = tuple(sorted((o, 1) for o in outs[s]))
        fired.add(name(s))
        seen = {init: []}
        frontier = [init]
        edges = {}
        while frontier and len(seen) < max_states:
            st = frontier.pop()
            nxt = succ(st)
            edges[st] = [b for _, b in nxt]
            for lbl, b in nxt:
                fired.add(lbl.replace(' (início)', ''))
                if any(v > 1 for _, v in b):
                    over = [name(frm[p]) + ' → ' + name(to[p]) for p, v in b if v > 1 and p in frm]
                    issues.append('[%s] falta de sincronização: dois tokens no mesmo fluxo (%s) após "%s"' % (name(s), '; '.join(over), lbl))
                if b not in seen:
                    seen[b] = []
                    frontier.append(b)
        if len(seen) >= max_states:
            issues.append('[%s] espaço de estados grande demais (possível laço sem controle)' % name(s))
            continue
        # deadlocks e opção de completar
        final = ()
        can_finish = {final} if final in seen else set()
        changed = True
        while changed:
            changed = False
            for st, nx in edges.items():
                if st not in can_finish and any(b in can_finish for b in nx):
                    can_finish.add(st); changed = True
        for st in seen:
            if st != final and not edges.get(st):
                places = [(name(frm[p]) + ' → ' + name(to[p])) if p in frm else p for p, v in st]
                issues.append('[%s] deadlock: token parado em %s' % (name(s), '; '.join(places)))
        stuck = [st for st in seen if st not in can_finish and edges.get(st)]
        if stuck:
            issues.append('[%s] livelock/sem opção de completar: %d estado(s) de onde o fim nunca é alcançado' % (name(s), len(stuck)))
    for i, k in kinds.items():
        if k.startswith('start') or k.startswith('boundary') or k == 'link-CATCH' or k == 'eventsub':
            continue
        if name(i) not in fired and ins[i]:
            issues.append('nó morto (nunca executado): "%s"' % name(i))
    return sorted(set(issues))


def check_diagram(root):
    out = []
    for wp in root.find(q('WorkflowProcesses')):
        if wp.find(q('Activities')) is None:
            continue
        out += analyse(root, wp)
        for aset in wp.iter(q('ActivitySet')):
            pass
    return out
