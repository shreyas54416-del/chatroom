@echo off
set "PATH=%PATH%;C:\Program Files\nodejs\"

echo [1/4] Creating directories...
mkdir backend

echo [2/4] Initializing Backend...
cd backend
call npm init -y
call npm install express socket.io cors dotenv
cd ..

echo [3/4] Initializing Frontend (Vite)...
call npx.cmd create-vite frontend --template react
cd frontend
call npm install
cd ..

echo [4/4] Finished Setup.
