from xlang_http import http
from xlang_os import fs
from xlang_os import utils
import xlangkernel

port = 9088
srv = http.Server()
root = "../frontend"
print("root=${root},pid=",pid())

kmgt = xlangkernel.KernelManager()

@srv.route("/api/newSession")
def newSession():
	sessionId = utils.generate_uid()
	code = "print('new session')"
	kmgt.runCode(sessionId,code)
	idPack = {"sessionId":sessionId}
	return [str(idPack,format=True), "text/json"]

@srv.route("/api/runCode")
def runCode():
	print("inside runCode")
	params = req.params
	sessionId = params["sessionId"]
	code = params["code"]
	code = code.slice(1,code.size()-1)
	kmgt.runCode(sessionId,code)
	return [{"ret":True}, "text/json"]

@srv.route("/api/fetchOutputs")
def fetchOutputs():
	print("inside fetchOutputs")
	params = req.params
	sessionId = params["sessionId"]
	retVal = kmgt.fetchOutputs(sessionId)
	print("fetchOutputs,ret",retVal)
	return [{"ret":retVal}, "text/json"]

def retreiveContent(filePath,openMode):
  f = fs.File(filePath,openMode)
  f_size = f.size
  if f_size >=0:
    data = f.read(f_size)
  else:
    data = ""
  f.close()
  return data

# match root case for example, https://sitename
@srv.route("/")
def ToIndexPage():
	filePath =root+"/index.html"
	content = retreiveContent(filePath,"r");
	return [content, "text/html"]

# match all others, this part must be the last rule
@srv.route('.*')
def GetOthers(req,res):
	path = req.path
	pos = path.rfind(".")
	mime = "text/html"
	openMode ="r"
	if pos >0:
		ext = path.slice(pos+1,path.size())
	if ext == "js":
		mime = "text/javascript"
	elif ext == "css":
		mime = "text/css"
	elif ext == "jpg":
		mime = "image/jpeg"
		openMode ="rb"
	params = req.params
	filePath = root+path
	# print("open file:${filePath}",mime)
	content = retreiveContent(filePath,openMode)
	res.add_header("X-Frame-Options","AllowAll")
	res.set_content(content, mime)

print("http Server Started,port:${port}")
srv.listen("::", port)
