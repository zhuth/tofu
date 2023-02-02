import glob
import json
with open('db.js', 'w', encoding='utf-8') as fo:
    fo.write('window.tofu = {};\n')
    for j in glob.glob('*.json'):
        if 'package' in j: continue
        js = json.load(open(j, 'r', encoding='utf-8'))
        fo.write(f'window.tofu["{j[:-5]}"] = {json.dumps(js, ensure_ascii=False, indent=2)};\n')