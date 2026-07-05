@echo off
rem Serveur dev de TEST : DB vosthermos_dev + dist separe .next.test, port 3123.
rem Utilise par la preview Claude pour verifier l'admin sans toucher a la DB de dev.
cd /d "C:\Users\info\Documents\App Erik\vosthermos"
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vosthermos_dev
set NEXT_DIST_DIR=.next.test
set PORT=3123
npm run dev
