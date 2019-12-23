set path=%PATH%;"C:\Program Files\nodejs"
start "%~dp0chatserver" node chatserver.js
ping -n 1 127.0.0.1 >nul
start "%~dp0loginserver 1" node loginserver.js 1
start "%~dp0loginserver 2" node loginserver.js 2
start "%~dp0webserver 2" node webserver.js
