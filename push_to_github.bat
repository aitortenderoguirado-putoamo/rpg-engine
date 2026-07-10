@echo off
echo === SUBIR CODIGO A GITHUB ===
echo.
echo Configurando remoto a: https://github.com/aitortenderoguirado-putoamo/rpg-engine.git
git remote remove origin 2>nul
git remote add origin https://github.com/aitortenderoguirado-putoamo/rpg-engine.git
git branch -M main

echo.
echo Enviando archivos a GitHub...
echo (Si Git te lo solicita, introduce tu usuario y tu Personal Access Token o inicia sesion en la ventana emergente)
echo.
git push -u origin main

echo.
echo Proceso finalizado.
pause
