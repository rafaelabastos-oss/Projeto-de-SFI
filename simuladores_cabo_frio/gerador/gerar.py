#!/usr/bin/env python3
"""Gera os simuladores Prime 3D a partir do template e do bloco de dados de cada negocio.

uso: python3 gerar.py [negocio ...]   (sem argumento, gera todos)

O template (template.html) e o motor comum. Cada arquivo em negocios/<id>.js
traz o bloco de dados do negocio, dividido em secoes marcadas por
//@@SECAO: DADOS (obrigatoria, entra no topo do script), TARDIO (entra depois
da biblioteca de pecas 3D) e HTML (pares chave=valor para o cabecalho).
"""
import os, re, sys, json
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.dirname(AQUI)

def secoes(txt):
    partes = re.split(r'^//@@([A-Z]+)\s*$', txt, flags=re.M)
    out = {'DADOS': partes[0]}
    for i in range(1, len(partes), 2):
        out[partes[i]] = out.get(partes[i], '') + partes[i + 1]
    return out

def gerar(neg):
    tpl = open(os.path.join(AQUI, 'template.html'), encoding='utf-8').read()
    sec = secoes(open(os.path.join(AQUI, 'negocios', neg + '.js'), encoding='utf-8').read())
    meta = {}
    for linha in sec.get('HTML', '').strip().splitlines():
        if '=' in linha and not linha.lstrip().startswith('//'):
            k, v = linha.split('=', 1)
            meta[k.strip()] = v.strip()
    html = tpl.replace('/*@@DADOS@@*/', sec['DADOS'].rstrip() + '\n')
    html = html.replace('/*@@TARDIO@@*/', sec.get('TARDIO', '').rstrip() + '\n')
    est = json.load(open(os.path.join(AQUI, 'estudos.json'), encoding='utf-8'))
    html = html.replace('/*@@ESTUDOS@@*/', json.dumps(est, ensure_ascii=False, indent=1))
    for k, v in meta.items():
        html = html.replace('@@' + k + '@@', v)
    resto = sorted(set(re.findall(r'@@[A-Z_]+@@', html)))
    if resto:
        raise SystemExit(f'{neg}: marcadores sem valor: {resto}')
    nome = meta.get('ARQUIVO', neg + '_prime_3d_v1.0.html')
    destino = os.path.join(SAIDA, nome)
    open(destino, 'w', encoding='utf-8').write(html)
    return destino

if __name__ == '__main__':
    alvos = sys.argv[1:] or [f[:-3] for f in sorted(os.listdir(os.path.join(AQUI, 'negocios'))) if f.endswith('.js')]
    for n in alvos:
        print(gerar(n))
