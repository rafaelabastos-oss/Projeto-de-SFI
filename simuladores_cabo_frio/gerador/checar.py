import sys,re,subprocess,tempfile
h=open(sys.argv[1]).read()
scripts=re.findall(r'<script>(.*?)</script>',h,flags=re.S)
js=max(scripts,key=len)
p=tempfile.mktemp(suffix='.js');open(p,'w').write(js)
r=subprocess.run(['node','--check',p],capture_output=True,text=True)
print(r.stderr[:1500] or 'sintaxe ok')
