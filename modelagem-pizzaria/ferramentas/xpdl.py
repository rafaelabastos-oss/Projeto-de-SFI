"""Leitura e escrita fiel do Diagram.xml (XPDL 2.2) do Bizagi Modeler 4.3."""
import re, uuid
import xml.etree.ElementTree as ET

NS = 'http://www.wfmc.org/2009/XPDL2.2'
XSI = 'http://www.w3.org/2001/XMLSchema-instance'
XSD = 'http://www.w3.org/2001/XMLSchema'
Q = '{%s}' % NS


def q(tag):
    return Q + tag


def local(tag):
    return tag.split('}', 1)[1] if tag.startswith('{') else tag


def parse(path):
    raw = open(path, 'rb').read().decode('utf-8-sig')
    # ET descarta xmlns; guardamos a ordem original dos atributos da raiz
    return ET.fromstring(raw)


def _esc_attr(v):
    return (v.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;').replace('\r', '&#xD;').replace('\n', '&#xA;').replace('\t', '&#x9;'))


def _esc_text(v):
    return v.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _attr_name(k):
    if k.startswith('{' + XSI + '}'):
        return 'xsi:' + k.split('}', 1)[1]
    return k


def _write(el, out, depth):
    ind = '  ' * depth
    tag = local(el.tag)
    attrs = ''.join(' %s="%s"' % (_attr_name(k), _esc_attr(v)) for k, v in el.attrib.items())
    children = list(el)
    text = el.text if (el.text and el.text.strip() != '' or (el.text and not children and el.text != '' and not el.text.isspace())) else None
    if not children and (text is None):
        out.append('%s<%s%s />' % (ind, tag, attrs))
    elif not children:
        out.append('%s<%s%s>%s</%s>' % (ind, tag, attrs, _esc_text(text), tag))
    else:
        out.append('%s<%s%s>' % (ind, tag, attrs))
        for c in children:
            _write(c, out, depth + 1)
        out.append('%s</%s>' % (ind, tag))


def serialize(root):
    out = ['<?xml version="1.0"?>']
    tag = local(root.tag)
    attrs = ' xmlns:xsd="%s" xmlns:xsi="%s"' % (XSD, XSI)
    attrs += ''.join(' %s="%s"' % (_attr_name(k), _esc_attr(v)) for k, v in root.attrib.items())
    attrs += ' xmlns="%s"' % NS
    out.append('<%s%s>' % (tag, attrs))
    for c in root:
        _write(c, out, 1)
    out.append('</%s>' % tag)
    return '\r\n'.join(out)


def new_id():
    return str(uuid.uuid4())
