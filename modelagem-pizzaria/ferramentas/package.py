"""Gera o .bpm revisado: um .diag (zip) por diagrama + arquivos do projeto, na mesma ordem do original."""
import io, os, re, zipfile, datetime
from xpdl import parse, q, serialize


def integrity(root, name):
    ids = [e.get('Id') for e in root.iter() if e.get('Id') and e.tag.split('}')[1] not in ('Message', 'SubFlow')]
    dup = {i for i in ids if ids.count(i) > 1}
    assert not dup, (name, 'IDs duplicados', dup)
    known = set(ids)
    for t in root.iter(q('Transition')):
        assert t.get('From') in known and t.get('To') in known, (name, 'fluxo solto', t.get('Id'))
    for m in root.iter(q('MessageFlow')):
        assert m.get('Source') in known and m.get('Target') in known, (name, 'mensagem solta', m.get('Id'))
    for a in root.iter(q('Association')):
        assert a.get('Source') in known and a.get('Target') in known, (name, 'associação solta', a.get('Id'))
    for ev in root.iter(q('IntermediateEvent')):
        if ev.get('IsAttached') == 'true':
            assert ev.get('Target') in known, (name, 'borda sem atividade')
    for d in root.iter(q('DataStoreReference')):
        assert d.get('DataStoreRef') in {s.get('Id') for s in root.iter(q('DataStore'))}, (name, 'repositório sem definição')


def ext_attr_values(root):
    lines = ['<?xml version="1.0"?>',
             '<DiagramAttributeValues xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">']
    for tag in ('Activity', 'DataObject', 'DataStoreReference', 'Artifact'):
        for e in root.iter(q(tag)):
            lines += ['  <ElementAttributeValues ElementId="%s">' % e.get('Id'), '    <Values />', '  </ElementAttributeValues>']
    lines.append('</DiagramAttributeValues>')
    return '\r\n'.join(lines)


def package(orig_bpm, bpm_dir, built, out):
    """orig_bpm: .bpm original; bpm_dir: .bpm original extraído; built: pasta com x/<id>/Diagram.xml; out: .bpm novo"""
    zin = zipfile.ZipFile(orig_bpm)
    now = datetime.datetime.now().astimezone().isoformat(timespec='microseconds')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            if info.filename.endswith('.diag'):
                did = info.filename[:-5]
                inner_in = zipfile.ZipFile(os.path.join(bpm_dir, info.filename))
                root = parse(os.path.join(built, 'x', did, 'Diagram.xml'))
                integrity(root, root.get('Name'))
                # data de modificação no cabeçalho do pacote
                root.find(q('PackageHeader')).find(q('ModificationDate')).text = now
                buf = io.BytesIO()
                with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zd:
                    for ii in inner_in.infolist():
                        if ii.filename == 'Diagram.xml':
                            zd.writestr(ii.filename, serialize(root).encode('utf-8'))
                        elif ii.filename == 'ExtendedAttributeValues.xml':
                            zd.writestr(ii.filename, ext_attr_values(root).encode('utf-8'))
                        else:
                            zd.writestr(ii.filename, inner_in.read(ii.filename))
                data = buf.getvalue()
            elif info.filename == 'ModelInfo.xml':
                data = re.sub(rb'ModifiedDate="[^"]+"', ('ModifiedDate="%s"' % now).encode(), data)
            zout.writestr(info.filename, data)
    return out
