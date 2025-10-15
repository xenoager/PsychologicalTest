@echo off
setlocal
set SITE_ORIGIN=https://mindpickq.com
set INDEXNOW_KEY=319a8909b8fabce6a18179e2fc8840f2
node scripts\indexnow\ping-bulk.mjs --verbose
echo ExitCode=%ERRORLEVEL%
pause