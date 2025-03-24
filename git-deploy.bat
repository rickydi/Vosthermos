@echo off
echo ---------------------------------------
echo    SCRIPT DE DEPLOIEMENT VOSTHERMOS
echo ---------------------------------------
echo.

REM Ajouter tous les fichiers modifiés
echo 1. Ajout des fichiers modifiés...
git add .

REM Demander un message de commit
set /p COMMIT_MSG="Entrez votre message de commit: "

REM Créer un commit avec le message
echo.
echo 2. Création du commit...
git commit -m "%COMMIT_MSG%"

REM Pousser les changements vers GitHub
echo.
echo 3. Envoi des modifications vers GitHub...
git push

echo.
echo ---------------------------------------
echo    DEPLOIEMENT TERMINE AVEC SUCCES
echo ---------------------------------------
echo.

pause
