@echo off
echo ---------------------------------------
echo    SCRIPT DE DEPLOIEMENT VOSTHERMOS
echo ---------------------------------------
echo.

REM Ajouter tous les fichiers modifiés
echo 1. Ajout des fichiers modifiés...
git add .
echo Fichiers ajoutés avec succès.

REM Demander un message de commit
set /p COMMIT_MSG="Entrez votre message de commit: "

REM Créer un commit avec le message
echo.
echo 2. Création du commit...
git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% NEQ 0 (
  echo ERREUR: Le commit a échoué. Vérifiez qu'il y a des modifications à envoyer.
  pause
  exit /b 1
)
echo Commit créé avec succès.

REM Pousser les changements vers GitHub
echo.
echo 3. Envoi des modifications vers GitHub...
git push
if %ERRORLEVEL% NEQ 0 (
  echo ERREUR: Impossible de pousser vers GitHub. Vérifiez votre connexion internet.
  pause
  exit /b 1
)
echo Push terminé avec succès.

echo.
echo ---------------------------------------
echo    DEPLOIEMENT TERMINE AVEC SUCCES
echo ---------------------------------------
echo.

echo Le site est maintenant à jour sur GitHub.
echo Les changements devraient être visibles sur votre site déployé dans quelques minutes.
echo.

pause
