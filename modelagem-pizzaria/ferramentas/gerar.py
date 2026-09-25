"""Regera o modelo revisado a partir do .bpm original.

    python3 gerar.py            # gera ../Pizzaria_AS-IS_Revisado.bpm e verifica
    python3 gerar.py --png      # também desenha as prévias em ../diagramas (precisa de Node + Playwright)

As correções de cada diagrama estão em build.py.
"""
import glob, os, subprocess, sys, tempfile, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ORIGINAL = os.path.join(ROOT, 'original', 'Pizzaria_AS-IS_Versao_Final_1.bpm')
SAIDA = os.path.join(ROOT, 'Pizzaria_AS-IS_Revisado.bpm')
ORDEM = ['466315c9', '59a06987', '0893fedb', '24c1cec0', '26f2c9c2', 'fb70f7d7', '970cc9fa', 'fee6de02',
         'b837a231', '79a386ae', '113b5873', 'c2f413c8', '97e08fff', '2bee7f79', 'fdc3342e', '2bc2d6ca']


def extrair(bpm, destino):
    zipfile.ZipFile(bpm).extractall(destino)
    for diag in glob.glob(os.path.join(destino, '*.diag')):
        did = os.path.basename(diag)[:-5]
        zipfile.ZipFile(diag).extractall(os.path.join(destino, 'x', did))


def main():
    tmp = tempfile.mkdtemp(prefix='pizzaria_')
    bpm_dir = os.path.join(tmp, 'original')
    extrair(ORIGINAL, bpm_dir)
    os.environ['PIZZARIA_BPM_DIR'] = bpm_dir
    sys.path.insert(0, HERE)
    from xpdl import parse
    import build, check, modelcheck, package

    built = os.path.join(tmp, 'revisado')
    problemas = 0
    for did, d in build.build_all().items():
        os.makedirs(os.path.join(built, 'x', did))
        open(os.path.join(built, 'x', did, 'Diagram.xml'), 'wb').write(d.xml().encode('utf-8'))
        r = parse(os.path.join(built, 'x', did, 'Diagram.xml'))
        for p in check.check_diagram(r):
            print('  %s: %s' % (r.get('Name'), p)); problemas += 1
    for p in modelcheck.run(built):
        print('  ' + p); problemas += 1
    package.package(ORIGINAL, bpm_dir, built, SAIDA)
    print('gerado:', SAIDA, '| problemas encontrados pelo verificador:', problemas)

    if '--png' in sys.argv:
        from render import render
        pasta = os.path.join(ROOT, 'diagramas')
        svgs = []
        for i, pref in enumerate(ORDEM, 1):
            f = glob.glob(os.path.join(built, 'x', pref + '*', 'Diagram.xml'))[0]
            r = parse(f)
            svg = os.path.join(pasta, '%02d_%s.svg' % (i, r.get('Name').replace(' ', '_')))
            open(svg, 'w').write(render(r, r.get('Name')))
            svgs.append(svg)
        subprocess.run(['node', os.path.join(HERE, 'shot.js')] + svgs, check=True)
        for s in svgs:
            os.remove(s)
        print('prévias em', pasta)


if __name__ == '__main__':
    main()
