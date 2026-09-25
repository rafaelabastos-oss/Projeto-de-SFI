"""Remodelagem do modelo AS-IS da Pizzaria (Bizagi). Cada função corrige um diagrama.
Os IDs originais são mantidos sempre que o elemento continua existindo."""
import os, re, sys
from edit import Diagram
from xpdl import q

# ------------------------------------------------------------------ ajudantes

def T(d, a, x, cy, w=142, h=60):
    d.move(a, x, cy - h / 2, w, h)


def E(d, a, x, cy, label=None):
    if label:
        d.act(a).set('_label', label)
    d.move(a, x, cy - 18, 36, 36)


def G(d, a, x, cy, label=None):
    if label:
        d.act(a).set('_label', label)
    d.move(a, x, cy - 21, 42, 42)


def nT(d, name, x, cy, kind='Manual', w=142, h=60, **kw):
    return d.task(name, x, cy - h / 2, kind, w, h, **kw)


def nE(d, kind, name, x, cy, label='below', **kw):
    return d.event(kind, name, x, cy - 18, label, **kw)


def nG(d, name, x, cy, gtype='Exclusive', label='above', **kw):
    return d.gateway(name, x, cy - 21, gtype, label, **kw)


def normalize_names(d):
    def norm(s):
        return re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip()
    for tag in ('Activity', 'Pool', 'Lane', 'WorkflowProcess', 'DataObject', 'DataStore', 'Transition', 'MessageFlow'):
        for e in d.root.iter(q(tag)):
            if e.get('Name'):
                e.set('Name', norm(e.get('Name')))


def main_pool(d):
    pid = d.main_wp().get('Id')
    for p in d.root.iter(q('Pool')):
        if p.get('Process') == pid:
            return p.get('Id')


def pool_of(d, name):
    return d.pool_by_name(name).get('Id')


def mv(d, anyid, x, y, w=None, h=None):
    d.move_node_el(d.byid(anyid), x, y, w, h)


def reassoc(d, src, dst, pts):
    """refaz a associação src->dst com novos pontos"""
    fs, fd = d.byid(src).get('Id'), d.byid(dst).get('Id')
    for a in list(d.root.iter(q('Association'))):
        if a.get('Source') == fs and a.get('Target') == fd:
            d.parent_of(a).remove(a)
    d.assoc(fs, fd, pts)


# ------------------------------------------------------------------ 1. Cadeia de Valor

def cadeia_de_valor(d):
    d.clear_flows()
    d.del_msgs(lambda e: True)
    d.delete('e52c7aa0')                               # XOR "Canal de atendimento?" sem atividade anterior
    pool = main_pool(d)
    d.set_lanes(pool, [('Atendimento ao cliente', 270), ('Apoio à operação', 330)])
    d.set_pool(pool, 70, 70, 760, 600)
    # atendimento: duas entradas explícitas (salão e delivery), como no gabarito do professor
    s1 = '7ea79176'; d.rename(s1, 'Cliente chega ao salão'); E(d, s1, 150, 150)
    s2 = nE(d, 'start-Message', 'Pedido por telefone ou site', 150, 270)
    T(d, 'f7c1e4dd', 230, 150, 210, 80)
    T(d, '45ceb8e1', 230, 270, 210, 80)
    g = '67088aab'; G(d, g, 520, 210)
    e = '9a427ed9'; d.rename(e, 'Atendimento ao cliente encerrado'); E(d, e, 620, 210)
    d.flow(s1, 'f7c1e4dd'); d.flow(s2, '45ceb8e1')
    d.flow('f7c1e4dd', g, out='R', inn='T'); d.flow('45ceb8e1', g, out='R', inn='B')
    d.flow(g, e)
    # apoio: cada rotina tem gatilho, execução e desfecho próprios (antes estavam soltas)
    gf = 'a809402a'; d.rename(gf, 'Gestão Financeira')
    d.act(gf).find(q('Implementation')).find(q('SubFlow')).set('Id', '03ae3cc3-933c-422a-b28b-a183eaee8edd')
    ci = 'ff61bbd5'; d.rename(ci, 'Aquisição de Insumos')
    d.rename('7db2c2c7', 'Pré-preparação de Ingredientes')
    d.act(ci).find(q('Implementation')).find(q('SubFlow')).set('Id', 'c2f24015-6cbd-4197-86a5-5f4b86786db3')
    oi = '7db2c2c7'
    rows = [(gf, 'start-Timer', 'Início do expediente', 'Expediente encerrado', 395),
            (oi, 'start-Conditional', 'Início do turno ou baixa demanda', 'Ingredientes disponíveis', 505),
            (ci, 'start-Conditional', 'Estoque no nível mínimo', 'Insumos disponíveis', 615)]
    for sub, sk, sn, en, cy in rows:
        st = nE(d, sk, sn, 150, cy)
        T(d, sub, 230, cy, 290, 70)
        en_ = nE(d, 'end-None', en, 600, cy)
        d.flow(st, sub); d.flow(sub, en_)
    d.set_doc_pkg('Como a Pizzaria (Rio das Ostras) funciona hoje: o cliente é atendido de duas formas — '
                  'no salão ou por delivery —, cada uma com seu próprio gatilho, e a operação se apoia em três '
                  'rotinas de bastidor, cada uma com gatilho e desfecho próprios: cuidar do caixa (Gestão '
                  'Financeira), deixar os ingredientes prontos (Pré-preparação de Ingredientes) e comprar insumos '
                  '(Aquisição de Insumos). O caso não descreve as '
                  'atividades de gestão do negócio.')


# ------------------------------------------------------------------ 2. Serviço no Local

def servico_no_local(d):
    d.clear_flows()
    pool = main_pool(d)
    d.set_pool(pool, 70, 70, 1470, 360)
    cy = 240
    s = 'a55a02dd'; d.rename(s, 'Cliente chega ao salão'); E(d, s, 140, cy)
    rec = '205b3d08'; T(d, rec, 200, cy)
    g1 = '669bd5bf'; d.rename(g1, 'Resultado da recepção?'); G(d, g1, 400, cy)
    d.label_box(g1, 296, 170, 100, 34)
    des = nE(d, 'end-None', 'Cliente desistiu do atendimento', 403, 125, 'right')
    lev = 'd7494151'; d.rename(lev, 'Atender o pedido para levar'); T(d, lev, 490, 350)
    lev_end = nE(d, 'end-None', 'Pedido para levar atendido', 680, 350, 'right')
    m = nG(d, '', 540, cy, label='above')
    at, pr, sm = 'f85341ff', '28bb76ac', 'fece247c'
    T(d, at, 620, cy); T(d, pr, 800, cy); T(d, sm, 980, cy)
    g2 = '605f18e8'; d.rename(g2, 'Resultado do serviço na mesa?'); G(d, g2, 1160, cy, 'below')
    pg = 'a38dcad3'; T(d, pg, 1260, cy)
    e = '2f3d55bd'; E(d, e, 1450, cy)
    d.flow(s, rec); d.flow(rec, g1)
    d.flow(g1, m, 'Cliente acomodado', True, label_at=(444, 214))
    d.flow(g1, des, 'Desistiu', True, out='T', inn='B', label_at=(425, 160))
    d.flow(g1, lev, 'Para levar', True, out='B', inn='L', label_at=(425, 290))
    d.flow(lev, lev_end)
    d.flow(m, at); d.flow(at, pr); d.flow(pr, sm); d.flow(sm, g2)
    d.flow(g2, pg, 'Conta pronta', True, label_at=(1170, 214))
    d.flow(g2, m, 'Novo pedido', True, out='T', inn='T', via=[(1181, 160), (561, 160)], label_at=(820, 140))
    d.flow(pg, e)
    d.set_doc_pkg('Serviço no Local. Retomado no início de 2022. Recepção do cliente → atendimento → preparação '
                  'do pedido → serviço nas mesas → pagamento. A decisão de novo pedido é tomada uma única vez, '
                  'a partir do estado em que o Serviço nas Mesas termina (novo pedido ou conta pronta); o laço '
                  'volta por um gateway de convergência e sempre tem saída, porque cada volta depende de o '
                  'cliente fazer um pedido. A Recepção termina em três estados (acomodado, para levar, desistiu) '
                  'e cada um tem seu desfecho. A Pizzaria trabalha apenas com pizzas à la carte no salão.')


# ------------------------------------------------------------------ 3. Serviço Delivery

def servico_delivery(d):
    d.clear_flows()
    pool = main_pool(d)
    d.set_pool(pool, 70, 70, 1240, 510)
    ya, yb, ym = 190, 360, 275
    s1 = 'f43c47e3'; E(d, s1, 140, ya)
    at = '1ac72844'; T(d, at, 200, ya)
    g1 = '368175dc'; G(d, g1, 360, ya, 'below')
    e1 = '80097f2e'; d.rename(e1, 'Contato encerrado sem pedido'); E(d, e1, 363, 105, 'right')
    s2 = '98d1ecc8'; E(d, s2, 140, yb)
    vs = '0037c083'; T(d, vs, 200, yb)
    bd = '2e996345'; d.attach(bd, vs); d.act(bd).set('_label', 'belowright'); d.move(bd, 214, yb + 30 - 18, 36, 36)
    g2 = nG(d, 'Resultado da venda?', 360, yb, label='above')
    rec = nE(d, 'end-None', 'Pedido recusado', 470, 425, 'right')
    canc = nT(d, 'Cancelar o pedido de venda', 270, 500, 'User')
    ec = '97d6090a'; E(d, ec, 460, 500, 'right')
    m = nG(d, '', 540, ym, label='above')
    pr, en, pc, fim = 'f9aca231', 'e054fc60', 'f4e3c3a1', '2a9ef90b'
    d.rename(pr, 'Preparação do Pedido Delivery')
    T(d, pr, 620, ym); T(d, en, 800, ym); T(d, pc, 980, ym); E(d, fim, 1170, ym)
    d.flow(s1, at); d.flow(at, g1)
    d.flow(g1, e1, 'Não', True, out='T', inn='B', label_at=(385, 135))
    d.flow(g1, m, 'Sim', True, out='R', inn='T', label_at=(430, 168))
    d.flow(s2, vs); d.flow(vs, g2)
    d.flow(g2, m, 'Aprovado', True, out='R', inn='B', label_at=(420, 338))
    d.flow(g2, rec, 'Recusado', True, out='B', inn='L', label_at=(385, 386))
    d.flow(bd, canc, out='B', inn='L'); d.flow(canc, ec)
    d.flow(m, pr); d.flow(pr, en); d.flow(en, pc); d.flow(pc, fim)
    d.set_doc(bd, 'O cliente pode cancelar o pedido do site a qualquer momento até o fim da Venda pelo Site. '
                  'Evento de borda interruptivo: interrompe a venda e segue para o cancelamento.')
    d.set_doc_pkg('Serviço Delivery. Inicia pelo atendimento telefônico ou pela venda pelo site (implantada no 1º '
                  'semestre de 2023). Só segue para a preparação o contato que virou pedido e a venda aprovada; '
                  'venda recusada e venda cancelada pelo cliente têm desfecho próprio. Depois da preparação vêm '
                  'a entrega e, após o retorno do entregador, a prestação de contas.')


# ------------------------------------------------------------------ 4. Recepção do Cliente

def recepcao(d):
    d.clear_flows()
    pool = main_pool(d)
    d.set_lanes(pool, [('Recepcionista', 390), ('Maître do salão', 120), ('Garçom', 120)])
    d.set_pool(pool, 70, 70, 1760, 630)
    r1, r2, r3 = 190, 320, 420
    s = '89945c69'; E(d, s, 170, r1)
    bv = 'c8240163'; T(d, bv, 230, r1)
    pc = nT(d, 'Perguntar se o consumo será no salão', 400, r1)
    gc = nG(d, 'Consumo no salão?', 575, r1, label='below')
    lev = nE(d, 'end-None', 'Cliente deseja pedido para levar', 578, 100, 'right')
    pr = '109b2d07'; T(d, pr, 670, r1)
    gr = '417632e0'; G(d, gr, 845, r1, 'below')
    cm = '428fbf2b'; T(d, cm, 940, r1)
    gm = '5868cf2b'; G(d, gm, 1115, r1, 'above')
    vi = '91855257'; T(d, vi, 1065, r2)
    ga = '0ae05d8f'; G(d, ga, 1240, r2, 'above')
    ds = 'cb9099e8'; E(d, ds, 1243, r3, 'left')
    il = 'e97e4801'; T(d, il, 1340, r2)
    ev = 'dd6cf3a0'; E(d, ev, 1530, r2)
    ch = '84a73451'; T(d, ch, 1600, r2)
    mg = '312f6023'; G(d, mg, 1650, r1)
    lt = '237a7b7f'; E(d, lt, 1740, r1)
    mv(d, '73bc7c36', 1395, 380)
    reassoc(d, il, '73bc7c36', [(1411, 350), (1411, 380)])
    # maître e garçom
    rm, rg = 520, 640
    lc = 'ef8db328'; E(d, lc, 170, rm)
    ac = '003653ef'; T(d, ac, 230, rm)
    ec = '8c8dff0f'; T(d, ec, 400, rm)
    ap = nT(d, 'Apresentar-se ao cliente', 570, rg)
    fim = 'f6f0646b'; d.rename(fim, 'Cliente acomodado à mesa'); E(d, fim, 760, rg)
    d.flow(s, bv); d.flow(bv, pc); d.flow(pc, gc)
    d.flow(gc, lev, 'Não, para levar', True, out='T', inn='B', label_at=(600, 128))
    d.flow(gc, pr, 'Sim', True, label_at=(598, 167))
    d.flow(pr, gr)
    d.flow(gr, mg, 'Sim', True, out='T', inn='T', via=[(866, 120), (1671, 120)], label_at=(870, 128))
    d.flow(gr, cm, 'Não', True, label_at=(868, 167))
    d.flow(cm, gm)
    d.flow(gm, mg, 'Sim', True, label_at=(1180, 167))
    d.flow(gm, vi, 'Não', True, out='B', inn='T', label_at=(1140, 245))
    d.flow(vi, ga)
    d.flow(ga, ds, 'Não', True, out='B', inn='T', label_at=(1265, 355))
    d.flow(ga, il, 'Sim', True, label_at=(1263, 297))
    d.flow(il, ev); d.flow(ev, ch)
    d.flow(ch, mg, out='T', inn='B')
    d.flow(mg, lt)
    d.flow(lc, ac); d.flow(ac, ec)
    d.flow(ec, ap, out='R', inn='T')
    d.flow(ap, fim)
    d.set_doc(ap, 'O garçom se apresenta uma única vez por mesa. Os pedidos seguintes da mesma mesa voltam ao '
                  'Atendimento ao Cliente sem repetir a apresentação.')
    d.set_doc_pkg('Recepção do Cliente. Recepcionista dá boas-vindas e identifica se o cliente vai consumir no salão '
                  'ou só levar; no salão, pergunta se há reserva; sem reserva, consulta a disponibilidade de mesa; '
                  'sem mesa, verifica se o cliente aceita a lista de espera e chama por ordem de chegada quando surge '
                  'espaço. Com reserva ou mesa disponível, o maître acompanha o cliente à mesa e entrega o cardápio, '
                  'e o garçom se apresenta. Termina em três estados: cliente acomodado à mesa, pedido para levar ou '
                  'desistência. Papéis: Recepcionista, Maître, Garçom. Registro: lista de espera em papel.')


# ------------------------------------------------------------------ 5. Atendimento ao Cliente

def atendimento_cliente(d):
    d.clear_flows()
    d.delete('7a96733d')          # "Apresentar-se ao cliente" passou para a Recepção (não se repete a cada pedido)
    pp = main_pool(d)
    cli = pool_of(d, 'Cliente')
    d.set_pool(cli, 70, 30, 1060, 90)
    d.set_pool(pp, 70, 142, 1060, 275)
    cy = 237
    s = 'b6d911a0'; d.rename(s, 'Cliente pronto para fazer o pedido'); E(d, s, 157, cy)
    rp, an, de, lv = 'aed3eab8', '61019a8d', 'deab834e', '5b0283e0'
    T(d, rp, 244, cy); T(d, an, 430, cy); T(d, de, 616, cy); T(d, lv, 802, cy)
    e = '7b8b52ad'; E(d, e, 1000, cy)
    mv(d, 'dec64641', 485, 320)
    reassoc(d, an, 'dec64641', [(501, 267), (501, 320)])
    d.flow(s, rp); d.flow(rp, an); d.flow(an, de); d.flow(de, lv); d.flow(lv, e)
    d.del_msgs(lambda m: True)
    d.msg(d.pool(cli).get('Id'), d.full(rp), 'Pedido ao vivo', [(315, 120), (315, 207)])
    d.set_doc_pkg('Atendimento ao Cliente. Garçom recebe o pedido, marca os itens na folha do bloco de notas, '
                  'destaca a folha e a leva ao balcão da cozinha mantendo a ordem de sequência. É executado a cada '
                  'pedido da mesa, inclusive nos novos pedidos; a apresentação do garçom acontece uma vez, na '
                  'Recepção. Papel: Garçom. Registro: folha do bloco de notas.')


# ------------------------------------------------------------------ 6. Serviço nas Mesas

def servico_nas_mesas(d):
    d.clear_flows()
    for a in ('b97ecd6c', 'bdeb63ff', '93d6da44'):   # "Ficar de olho", XOR sem dado, link sem receptor
        d.delete(a)
    d.del_msgs(lambda m: True)
    pp = main_pool(d); cli = pool_of(d, 'Cliente')
    W = 1500
    d.set_pool(cli, 70, 70, W, 50)
    d.set_lanes(pp, [('Garçom', 270), ('Maître do salão', 140)])
    d.set_pool(pp, 70, 142, W, 410)
    r1, r2, rm = 250, 350, 482
    s = '7eb57d8a'; E(d, s, 170, r1)
    pb, cm, sv = 'f362d74e', 'cc3e18df', '9783600f'
    d.rename(sv, 'Servir o pedido')
    T(d, pb, 230, r1); T(d, cm, 400, r1); T(d, sv, 570, r1)
    ge = nG(d, 'Solicitação do cliente?', 750, r1, 'EventBased', label='above')
    c1 = nE(d, 'inter-Message', 'Cliente faz novo pedido', 840, r1)
    e1 = nE(d, 'end-None', 'Novo pedido', 930, r1)
    c2 = nE(d, 'inter-Message', 'Cliente pede a conta', 1010, r2)
    ru, en = 'ff04119f', 'de06a011'
    T(d, ru, 1080, r2); T(d, en, 1250, r2)
    rg = 'fdfdd92f'; T(d, rg, 1250, rm)
    fim = '7086a75f'; E(d, fim, 1440, rm)
    mv(d, '1dbb2fdf', 1130, rm - 17)
    reassoc(d, rg, '1dbb2fdf', [(1250, rm), (1182, rm)])
    for ds in d.root.iter(q('DataStore')):
        ds.set('Name', 'Sistema de Faturamento')
    d.flow(s, pb); d.flow(pb, cm); d.flow(cm, sv); d.flow(sv, ge)
    d.flow(ge, c1); d.flow(c1, e1)
    d.flow(ge, c2, out='B', inn='L')
    d.flow(c2, ru); d.flow(ru, en); d.flow(en, rg, out='B', inn='T'); d.flow(rg, fim)
    cid = d.pool(cli).get('Id')
    d.msg(d.full(sv), cid, 'Pedido servido', [(641, 220), (641, 120)])
    d.msg(cid, d.full(c1), 'Novo pedido', [(858, 120), (858, 232)])
    d.msg(cid, d.full(c2), 'Pedido da conta', [(1028, 120), (1028, 332)])
    d.annotation('O garçom fica atento à mesa. O gateway baseado em eventos segue o que o cliente fizer primeiro: '
                 'novo pedido ou pedido da conta.', 580, 318, 170, 74)
    d.set_doc_pkg('Serviço nas Mesas. Garçom pega a bandeja, confere a mesa, serve e acompanha a mesa. O que acontece '
                  'depois depende do evento que chega primeiro (gateway baseado em eventos): se o cliente faz novo '
                  'pedido, o subprocesso termina no estado "Novo pedido" e o processo pai volta ao Atendimento ao '
                  'Cliente; se pede a conta, o garçom reúne as cópias dos pedidos e entrega ao maître, que registra '
                  'no Sistema de Faturamento (único sistema da pizzaria, desde a inauguração) e a conta fica pronta.')


# ------------------------------------------------------------------ 7/8. Preparação (salão e delivery)

def preparacao(d, split, join, salao):
    d.rename(split, 'Itens do pedido?')
    for t in d.transitions():
        if t.get('From') == d.full(split):
            nm = t.get('Name')
            t.set('Name', 'Tem bebida' if nm == 'Bebida' else 'Tem pizza')
            t.find(q('Condition')).find(q('Expression')).text = 'Pedido contém ' + ('bebida' if nm == 'Bebida' else 'pizza')
        if t.get('From') == d.full(join):
            c = t.find(q('Condition')); c.attrib.clear()
            for k in list(c):
                c.remove(k)
    x, y, w, h = d.geom(split)
    d.annotation('Inclusivo: o pedido pode ter só pizza, só bebida ou os dois (todo pedido tem ao menos um item). '
                 'A convergência inclusiva espera apenas os ramos que foram ativados.',
                 x + 190, y + 90, 260, 70)


# ------------------------------------------------------------------ 9. Atendimento Telefônico

def atendimento_telefonico(d):
    s = '33242c3d'; at = '0dd8b74f'
    d.set_task_type(at, 'None')            # a ligação já é recebida pelo evento de início de mensagem
    d.del_msgs(lambda m: True)
    x, y, w, h = d.geom(s)
    d.msg(pool_of(d, 'Cliente'), d.full(s), 'Ligação', [(x + w / 2, 120), (x + w / 2, y)])
    for t in d.transitions():
        if t.get('From') == d.full('3f754796') and t.find(q('Condition')).get('Type') is None:
            c = t.find(q('Condition')); c.set('Type', 'CONDITION')
            from xml.etree import ElementTree as ET
            ET.SubElement(c, q('Expression'))
        if t.get('From') == d.full('34431621'):
            c = t.find(q('Condition')); c.attrib.clear()
            for k in list(c):
                c.remove(k)
    for ds in d.root.iter(q('DataStore')):
        if 'ERP' in (ds.get('Name') or ''):
            ds.set('Name', 'Sistema de Faturamento')


# ------------------------------------------------------------------ 10. Venda pelo Site

def venda_site(d):
    ev = d.act('c55e4297')
    wp = d.main_wp()
    asets = wp.find(q('ActivitySets'))
    for s in list(asets):
        asets.remove(s)
    d.delete('c55e4297')          # cancelamento passa a ser o evento de borda em Serviço Delivery
    for p in d.root.iter(q('Pool')):
        if p.get('BoundaryVisible') == 'true':
            g = d.ngi(p)
            c = g.find(q('Coordinates'))
            d.set_pool(p.get('Id'), c.get('XCoordinate'), c.get('YCoordinate'), 820, g.get('Height'))
    d.annotation('Cancelamento pelo cliente: o evento de borda "Cliente cancela o pedido", anexado a esta venda no '
                 'processo Serviço Delivery, interrompe a venda em qualquer ponto e leva ao cancelamento.',
                 580, 380, 230, 80)
    for ds in d.root.iter(q('DataStore')):
        if 'ERP' in (ds.get('Name') or ''):
            ds.set('Name', 'Sistema de Faturamento')
    d.set_doc_pkg('Venda pelo Site. Atendente recebe o pedido de venda pelo website (cadastro, endereço, pagamento, '
                  'bebidas e pizzas, valores, data/hora) e analisa a viabilidade da entrega. Aprovado: emite a nota '
                  'fiscal no Sistema de Faturamento e leva a Ordem de Delivery ao balcão. Recusado: termina no estado '
                  '"Pedido recusado", tratado pelo processo pai. O cancelamento pelo cliente, possível até o fim da '
                  'venda, é o evento de borda anexado a esta atividade em Serviço Delivery.')


# ------------------------------------------------------------------ 11. Entrega de Pedidos

def entrega(d):
    pp = main_pool(d); cli = pool_of(d, 'Cliente')
    W = 1290
    for pid in (pp, cli):
        g = d.ngi(d.pool(pid)); c = g.find(q('Coordinates'))
        d.set_pool(pid, c.get('XCoordinate'), c.get('YCoordinate'), W, g.get('Height'))
    ep, xp, rd, pt = '784f54cd', 'f1c93672', '504c6f05', '7f7534f4'
    cc, ev, mj, rt, fim = '7bc6a65b', 'edfb5d17', 'e09f0fc3', '00588eb0', '0b0cb647'
    ds = '8edf7b65'
    for a, b in ((rd, pt), (pt, mj), (ev, mj), (mj, rt), (rt, fim), (xp, cc), (cc, ev), (xp, rd), (ds, ep), (ep, xp)):
        d.del_flow(a, b)
    r2, r3 = 530, 660
    T(d, ep, 218, r2); G(d, xp, 381, r2)
    T(d, rd, 480, r2)
    gt = nG(d, 'Troco a devolver?', 650, r2, label='below')
    d.rename(pt, 'Entregar o troco ao cliente'); T(d, pt, 740, r2)
    jt = nG(d, '', 910, r2)
    G(d, mj, 990, r2)
    T(d, rt, 1070, r2); E(d, fim, 1250, r2)
    T(d, cc, 480, r3); T(d, ev, 650, r3)
    d.flow(ds, ep, out='B', inn='T', via=[(805, 455), (289, 455)])
    d.flow(ep, xp)
    d.flow(xp, rd, 'Dinheiro', True, label_at=(398, 506))
    d.flow(xp, cc, 'Cartão', True, out='B', inn='L', label_at=(404, 600))
    d.flow(rd, gt)
    d.flow(gt, pt, 'Sim', True, label_at=(662, 508))
    d.flow(gt, jt, 'Não', True, out='T', inn='T', via=[(671, 480), (931, 480)], label_at=(760, 458))
    d.flow(pt, jt); d.flow(jt, mj)
    d.flow(cc, ev); d.flow(ev, mj, out='R', inn='B')
    d.flow(mj, rt); d.flow(rt, fim)
    d.del_msgs(lambda m: True)
    cid = d.pool(cli).get('Id')
    gy = float(d.ngi(d.pool(cli)).find(q('Coordinates')).get('YCoordinate'))
    d.msg(d.full(ep), cid, 'Pedido e nota fiscal', [(289, r2 + 30), (289, gy)])
    d.msg(d.full(ev), cid, 'Via do comprovante', [(721, r3 + 30), (721, gy)])
    d.set_doc(pt, 'Só acontece quando o cliente pediu troco na Ordem de Delivery (o troco foi providenciado pelo atendente).')


# ------------------------------------------------------------------ 12. Pagamento do Serviço

def pagamento(d):
    d.clear_flows()
    d.del_msgs(lambda m: True)
    pp = main_pool(d); cli = pool_of(d, 'Cliente')
    W = 2020
    d.set_pool(cli, 70, 70, W, 50)
    d.set_lanes(pp, [('Maître do salão', 290)])
    d.set_pool(pp, 70, 142, W, 290)
    r1, r2 = 240, 350
    s = '2c36da04'; E(d, s, 170, r1)
    ec, dm, pm = '29053b53', '30eeec70', '01757d16'
    T(d, ec, 230, r1); T(d, dm, 400, r1); T(d, pm, 570, r1)
    gp = '1eebd44c'; G(d, gp, 740, r1, 'above')
    rd = '64650522'; T(d, rd, 850, r1)
    gt = 'cb30f606'; d.rename(gt, 'Precisa de troco?'); G(d, gt, 1030, r1, 'below')
    dt = 'a2c93c99'; T(d, dt, 1120, r1)
    jt = 'fee4be8a'; G(d, jt, 1300, r1)
    jp = nG(d, '', 1380, r1)
    pc, vc = 'e7cf5bb0', 'c0cf8df0'
    T(d, pc, 850, r2); T(d, vc, 1030, r2)
    rr = 'c81c8e84'; T(d, rr, 1460, r1)
    nf = '892ff2a5'; d.rename(nf, 'Emitir a nota fiscal'); T(d, nf, 1630, r1)
    en = 'f8c6c1aa'; T(d, en, 1800, r1)
    fim = 'ebf919b6'; d.rename(fim, 'Serviço concluído'); E(d, fim, 1980, r1)
    mv(d, '57c8b374', 1505, 320)
    reassoc(d, rr, '57c8b374', [(1531, 270), (1531, 320)])
    for ds_ in d.root.iter(q('DataStore')):
        ds_.set('Name', 'Sistema de Faturamento')
    d.flow(s, ec); d.flow(ec, dm); d.flow(dm, pm); d.flow(pm, gp)
    d.flow(gp, rd, 'Dinheiro', True, label_at=(772, 216))
    d.flow(gp, pc, 'Cartão', True, out='B', inn='L', label_at=(765, 300))
    d.flow(rd, gt)
    d.flow(gt, dt, 'Sim', True, label_at=(1050, 216))
    d.flow(gt, jt, 'Não', True, out='T', inn='T', via=[(1051, 175), (1321, 175)], label_at=(1140, 153))
    d.flow(dt, jt); d.flow(jt, jp)
    d.flow(pc, vc); d.flow(vc, jp, out='R', inn='B')
    d.flow(jp, rr); d.flow(rr, nf); d.flow(nf, en); d.flow(en, fim)
    cid = d.pool(cli).get('Id')
    d.msg(d.full(dm), cid, 'Conta', [(471, r1 - 30), (471, 120)])
    d.msg(d.full(en), cid, 'Nota fiscal', [(1871, r1 - 30), (1871, 120)])
    d.set_doc_pkg('Pagamento do Serviço. Maître emite a conta, leva ao cliente e pergunta o meio de pagamento. '
                  'Dinheiro: recebe, confere e, se precisar, dá o troco. Cartão: passa na máquina e entrega a via do '
                  'comprovante. Os dois caminhos se juntam num gateway exclusivo e só então, uma única vez, o maître '
                  'registra o recebimento no Sistema de Faturamento, emite e entrega a nota fiscal.')


# ------------------------------------------------------------------ 14. Gestão Financeira

def gestao_financeira(d):
    d.clear_flows()
    d.delete('b5294a42')          # timer "Fim do expediente": o último turno encerra o expediente
    pp = main_pool(d)
    d.set_lanes(pp, [('Gerente Geral', 470), ('Maître e atendentes do delivery', 230)])
    d.set_pool(pp, 70, 70, 2200, 700)
    r1, r2, r3, r4, rm = 160, 300, 400, 490, 600
    s = '8bae83f4'; E(d, s, 170, r1)
    ab, di, rp = '947f4373', '18f730e3', 'aa45cfab'
    T(d, ab, 230, r1); T(d, di, 400, r1); T(d, rp, 570, r1)
    g0 = nG(d, '', 720, rm, label='above')
    rv, en = 'd09f4474', '38a14ef2'
    T(d, rv, 790, rm); T(d, en, 960, rm)
    og = 'd6c9e252'; T(d, og, 790, r2)
    tm = '40ef5b2a'; d.rename(tm, 'Fim do turno'); E(d, tm, 970, r2)
    g3 = nG(d, '', 1040, r2)
    cf = 'c7d35e6f'; T(d, cf, 1110, r2)
    gd = 'd530c0c6'; d.rename(gd, 'Há divergência?'); G(d, gd, 1280, r2, 'above')
    vl = '7ef9fa53'; T(d, vl, 1230, r3)
    gi = '61c59a33'; d.rename(gi, 'Divergência identificada?'); G(d, gi, 1410, r3, 'above')
    co = nT(d, 'Corrigir o lançamento divergente', 1230, r4, 'User')
    ro = 'f28568a1'; d.rename(ro, 'Registrar a ocorrência para apuração posterior'); T(d, ro, 1490, r3)
    g8 = 'ad49cacd'; G(d, g8, 1680, r2)
    gu = nG(d, 'Último turno do expediente?', 1760, r2, label='above')
    fc = '99b450be'; T(d, fc, 1840, r2)
    rs = '473183e0'; T(d, rs, 2010, r2)
    fim = '30602160'; E(d, fim, 2190, r2)
    mv(d, '06be9a3c', 835, 650)
    reassoc(d, rv, '06be9a3c', [(861, 630), (861, 650)])
    mv(d, '4570ed62', 2055, 360)
    reassoc(d, rs, '4570ed62', [(2081, 330), (2081, 360)])
    mv(d, '6892a3bd', 850, 180, 215, 75)
    reassoc(d, og, '6892a3bd', [(861, 270), (861, 255)])
    d.flow(s, ab); d.flow(ab, di); d.flow(di, rp)
    d.flow(rp, g0, out='R', inn='T')
    d.flow(g0, rv); d.flow(rv, en)
    d.flow(en, og, out='T', inn='B', via=[(1031, 360), (861, 360)])
    d.flow(og, tm); d.flow(tm, g3); d.flow(g3, cf); d.flow(cf, gd)
    d.flow(gd, g8, 'Não', True, label_at=(1520, 278))
    d.flow(gd, vl, 'Sim', True, out='B', inn='T', label_at=(1305, 330))
    d.flow(vl, gi)
    d.flow(gi, ro, 'Não', True, label_at=(1432, 378))
    d.flow(gi, co, 'Sim', True, out='B', inn='R', label_at=(1435, 436))
    d.flow(co, g3, out='L', inn='B', via=[(1061, r4)])
    d.flow(ro, g8, out='R', inn='B')
    d.flow(g8, gu)
    d.flow(gu, fc, 'Sim', True, label_at=(1780, 278))
    d.flow(gu, g0, 'Não, há outro turno', True, out='B', inn='B', via=[(1781, 745), (741, 745)], label_at=(1785, 690))
    d.flow(fc, rs); d.flow(rs, fim)
    d.set_doc(co, 'Divergência com causa identificada: corrige o registro e confere de novo. O laço sempre termina, '
                  'porque cada volta corrige uma divergência ou sai pelo registro da ocorrência.')
    d.set_doc_pkg('Gestão Financeira (apoio). Gerente Geral abre o caixa, confere o valor inicial de troco, '
                  'disponibiliza troco a maître e atendentes e registra na planilha de caixa. Em cada turno, os '
                  'responsáveis registram as vendas no Sistema de Faturamento e encaminham valores e comprovantes, que '
                  'o gerente organiza no caixa. No fim do turno o gerente confere caixa × sistema; divergência com causa '
                  'identificada é corrigida e conferida de novo; divergência não identificada é registrada para apuração '
                  'posterior. Se houver outro turno, o ciclo se repete; no último, fecha o caixa, registra o saldo e '
                  'guarda os valores em local seguro.')


# ------------------------------------------------------------------ 15. Pré-preparação de Ingredientes

def pre_preparacao(d):
    s = 'fb735a3b'
    se = d.act(s).find(q('Event')).find(q('StartEvent'))
    se.attrib.clear(); se.set('Trigger', 'Conditional')
    for c in list(se):
        se.remove(c)
    from xml.etree import ElementTree as ET
    tc = ET.SubElement(se, q('TriggerConditional')); ex = ET.SubElement(tc, q('Expression'))
    ex.text = 'Início do turno ou baixa demanda no salão'
    sp, jn = '541c5c00', '0aa3390d'
    d.set_gateway(sp, 'Inclusive'); d.set_gateway(jn, 'Inclusive')
    br = {'1edf6bf6': ('T', 'T'), 'a0aa451d': ('R', 'L'), '886b59be': ('B', 'B'), 'bd7ad8a7': ('B', 'B')}
    for tid in br:
        x_, y_, w_, h_ = d.geom(tid); d.move(tid, x_ + 40, y_)
    for nid in (jn, '016107f9', '2fe68c6c'):
        x_, y_, w_, h_ = d.geom(nid); d.move(nid, x_ + 40, y_)
    for tid, (o, i) in br.items():
        d.reroute(sp, tid, out=o if o != 'R' else 'R', inn='L')
        d.reroute(tid, jn, out='R', inn=i if i != 'L' else 'L')
    d.reroute(jn, '016107f9'); d.reroute('016107f9', '2fe68c6c')
    g_ = d.ngi(d.pool(main_pool(d))); d.set_pool(main_pool(d), 70, 70, int(float(g_.get('Width'))) + 40, g_.get('Height'))
    d.rename(sp, 'Preparos necessários?'); d.label_pos(sp, 'aboveleft')
    names = {'1edf6bf6': 'Vegetais', '47af8694': None, 'a0aa451d': 'Frios e queijos', '886b59be': 'Molho',
             'bd7ad8a7': 'Massa'}
    for t in d.transitions():
        if t.get('From') == d.full(sp):
            to = t.get('To')[:8]
            lbl = names.get(to)
            t.set('Name', lbl)
            c = t.find(q('Condition')); c.attrib.clear()
            for k in list(c):
                c.remove(k)
            c.set('Type', 'CONDITION'); e = ET.SubElement(c, q('Expression')); e.text = 'Quantidade definida de ' + lbl.lower() + ' > 0'
            pts = [(float(cc.get('XCoordinate')), float(cc.get('YCoordinate'))) for cc in t.iter(q('Coordinates'))]
            cgi = t.find(q('ConnectorGraphicsInfos')).find(q('ConnectorGraphicsInfo'))
            lx, ly = pts[-1][0] - 62, pts[-1][1] - 20
            cgi.set('TextX', str(int(lx))); cgi.set('TextY', str(int(ly))); cgi.set('TextWidth', '60'); cgi.set('TextHeight', '20')
    an = d.byid('bd5af840'); g_ = d.ngi(an); c_ = g_.find(q('Coordinates'))
    ax, ay = float(c_.get('XCoordinate')), float(c_.get('YCoordinate'))
    cx_, cy_, cw_, ch_ = d.geom('fa1fe5fc')
    d.move_node_el(an, cx_ + cw_ / 2 - 20, ay)
    reassoc(d, 'fa1fe5fc', 'bd5af840', [(cx_ + cw_ / 2, cy_ + ch_), (cx_ + cw_ / 2, ay)])
    x, y, w, h = d.geom(sp)
    d.annotation('Inclusivo: as quantidades definidas pelo pizzaiolo dizem quais preparos são necessários. No início do '
                 'turno costumam ser todos; na baixa demanda, só os que faltam. A convergência espera só os ramos ativados.',
                 1080, 100, 320, 80)
    d.set_doc_pkg('Pré-preparação de Ingredientes (apoio). No início do turno ou em baixa demanda (evento condicional), '
                  'o pizzaiolo consulta a previsão (histórico de vendas e reservas) e define as quantidades; o auxiliar '
                  'separa os ingredientes e faz só os preparos que as quantidades pedem (lava, corta e armazena vegetais; '
                  'fatia e porciona frios e queijos; prepara/reabastece molho; prepara e porciona a massa) e organiza tudo '
                  'na bancada de montagem. Quantidade insuficiente → comunica o Gerente Geral (aquisição).')


# ------------------------------------------------------------------ 16. Aquisição de Insumos

def aquisicao(d):
    d.clear_flows()
    d.del_msgs(lambda m: True)
    for a in list(d.root.iter(q('Association'))):
        d.parent_of(a).remove(a)
    d.delete('32596c53')          # fim "Substituição solicitada": o processo passa a esperar os itens substitutos
    pp = main_pool(d); fo = pool_of(d, 'Fornecedor')
    W = 2100
    d.set_pool(fo, 70, 70, W, 80)
    d.set_lanes(pp, [('Auxiliar de cozinha', 320), ('Gerente Geral', 280)])
    d.set_pool(pp, 70, 180, W, 600)
    r1, r2, r3, g1, g2 = 250, 360, 450, 570, 690
    s = 'b9b93cfe'; E(d, s, 170, r1)
    idn, cp = '6483417f', '8ad753f3'
    T(d, idn, 230, r1); T(d, cp, 400, r1)
    tm = '7984282a'; E(d, tm, 580, r1)
    el = '06f30c60'; T(d, el, 650, r1)
    vq, rp, cf, rg = 'db865fc4', 'a1229637', 'bd3cc994', 'c5995a0b'
    T(d, vq, 650, g1); T(d, rp, 820, g1); T(d, cf, 990, g1); T(d, rg, 1160, g1)
    gm = nG(d, '', 1290, r1, label='above')
    ch = '14a80aae'; E(d, ch, 1370, r1)
    cq = '370e324d'; T(d, cq, 1440, r1)
    gc = '4b45b41a'; G(d, gc, 1610, r1, 'below')
    ps, pj = '29bb013a', '21db2d25'
    G(d, ps, 1690, r1)
    ar, at, inf = '9e0c8e3d', '689271c5', '4c484bec'
    T(d, ar, 1770, r1); T(d, at, 1770, r2); T(d, inf, 1770, r3)
    G(d, pj, 1940, r1)
    fim = 'e6654eb5'; E(d, fim, 2020, r1)
    ct = '938d7ef3'; T(d, ct, 1560, g2)
    d.flow(s, idn); d.flow(idn, cp); d.flow(cp, tm); d.flow(tm, el)
    d.flow(el, vq, out='B', inn='T')
    d.flow(vq, rp); d.flow(rp, cf); d.flow(cf, rg)
    d.flow(rg, gm, out='T', inn='L', via=[(1231, r1)])
    d.flow(gm, ch); d.flow(ch, cq); d.flow(cq, gc)
    d.flow(gc, ps, 'Sim', True, label_at=(1630, 216))
    d.flow(gc, ct, 'Não', True, out='B', inn='T', label_at=(1636, 300))
    d.flow(ps, ar); d.flow(ps, at, out='B', inn='L')
    d.flow(at, inf, out='B', inn='T')
    d.flow(ar, pj); d.flow(inf, pj, out='R', inn='B')
    d.flow(pj, fim)
    d.flow(ct, gm, out='L', inn='B')
    fid = d.pool(fo).get('Id')
    d.msg(d.full(rp), fid, 'Pedido de compra', [(891, g1 - 30), (891, 150)])
    d.msg(fid, d.full(ch), 'Entrega dos insumos', [(1388, 150), (1388, r1 - 18)])
    d.msg(d.full(ct), fid, 'Solicitação de substituição', [(1702, g2), (2110, g2), (2110, 150)])
    mv(d, 'd2b153ec', 445, 300)
    d.assoc(d.full(cp), d.byid('d2b153ec').get('Id'), [(471, 280), (471, 300)])
    mv(d, '6d4028c0', 1205, 622)
    d.assoc(d.full(rg), d.byid('6d4028c0').get('Id'), [(1231, 600), (1231, 622)])
    d.set_doc(ct, 'Itens fora do padrão: o gerente pede a substituição e o processo volta a esperar a entrega. '
                  'O laço tem saída, porque cada volta depende de uma nova entrega do fornecedor.')
    d.set_doc_pkg('Aquisição de Insumos (apoio). Na conferência rotineira de estoque o auxiliar identifica item no nível '
                  'mínimo, consulta a planilha de estoque e registra a reposição; ao fim do turno envia a lista ao Gerente '
                  'Geral, que verifica quantidades, consulta fornecedores, faz o pedido, confirma prazo e valor e registra '
                  'na planilha de compras. Na chegada, o auxiliar confere quantidade e qualidade; divergência → Gerente '
                  'pede substituição ao fornecedor e o processo espera a nova entrega; correto → armazena e, em paralelo, '
                  'atualiza o estoque e avisa a cozinha.')


BUILD = {
    '466315c9-683f-43d5-9304-96c9236adc01': cadeia_de_valor,
    '59a06987-67da-497a-84b5-79cd05d8f832': servico_no_local,
    'fee6de02-1e2c-4dba-b346-d9ce1a06e6b0': servico_delivery,
    '0893fedb-c572-4c34-897f-ee793d381928': recepcao,
    '24c1cec0-f707-481d-93db-d0df02e82d2b': atendimento_cliente,
    'fb70f7d7-e19b-4b7e-a56e-2b928995311d': servico_nas_mesas,
    '26f2c9c2-7989-46a1-a842-b791daafc5d6': lambda d: preparacao(d, '66db7c8e', 'caf136ac', True),
    '113b5873-bed4-4ce3-9d9f-d9c615dbb7e0': lambda d: preparacao(d, '0e162063', 'fef55e52', False),
    'b837a231-a66b-4ab5-81b3-cbbdd553aead': atendimento_telefonico,
    '79a386ae-491d-4f7a-9296-0187eaad913c': venda_site,
    'c2f413c8-f012-4533-a2e6-5959c11f389f': entrega,
    '970cc9fa-780b-4431-a5c2-31494ac171bc': pagamento,
    '97e08fff-029b-4c28-acf7-5bcbfd9df338': lambda d: None,
    '2bee7f79-d579-45ce-b6a6-a1589acd9a76': gestao_financeira,
    'fdc3342e-ce10-4391-8270-77c89f24ba4d': pre_preparacao,
    '2bc2d6ca-0915-4a39-9adb-bd76e2a2216f': aquisicao,
}


def tarefas_sem_tipo(d):
    """Todas as tarefas como tarefa simples, sem o ícone de tipo (manual, usuário, envio, recebimento)."""
    for a in d.root.iter(q('Activity')):
        im = a.find(q('Implementation'))
        tk = im.find(q('Task')) if im is not None else None
        if tk is not None:
            for c in list(tk):
                tk.remove(c)


def build_all():
    out = {}
    for did, fn in BUILD.items():
        d = Diagram(did)
        fn(d)
        normalize_names(d)
        tarefas_sem_tipo(d)
        out[did] = d
    return out


if __name__ == '__main__':
    from render import render
    from check import check_diagram
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    ds = build_all()
    tot = 0
    for did, d in ds.items():
        xml = d.xml()
        os.makedirs(os.path.join(outdir, 'x', did), exist_ok=True)
        open(os.path.join(outdir, 'x', did, 'Diagram.xml'), 'wb').write(xml.encode('utf-8'))
        from xpdl import parse
        r = parse(os.path.join(outdir, 'x', did, 'Diagram.xml'))
        svg = render(r, r.get('Name'))
        nm = did[:8] + '_' + r.get('Name').replace(' ', '_')
        open(os.path.join(outdir, nm + '.svg'), 'w').write(svg)
        iss = check_diagram(r)
        tot += len(iss)
        print('==', r.get('Name'), '(%d)' % len(iss))
        for i in iss:
            print('   -', i)
    print('TOTAL', tot)
