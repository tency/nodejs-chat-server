set path=%PATH%;"C:\Program Files\nodejs"
start "%~dp0chatserver" node chatserver.js
ping -n 1 127.0.0.1 >nul
start "%~dp0loginserver 1" node loginserver.js 1
