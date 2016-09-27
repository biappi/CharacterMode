import json
f = open("chargen.json","w")
f.write("chargen = ")
f.write(json.dumps(map(ord, open("chargen","rb").read())))

