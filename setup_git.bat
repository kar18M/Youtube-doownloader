
@echo off
echo Running git init...
git init
if %errorlevel% neq 0 exit /b %errorlevel%

echo Adding files...
git add .
if %errorlevel% neq 0 exit /b %errorlevel%

echo Committing...
git commit -m "Initial commit"
if %errorlevel% neq 0 exit /b %errorlevel%

echo Renaming branch...
git branch -M main
if %errorlevel% neq 0 exit /b %errorlevel%

echo Adding remote...
git remote add origin https://github.com/kar18M/Youtube-doownloader.git
if %errorlevel% neq 0 echo Warning: Remote might already exist.

echo Pushing...
git push -u origin main
if %errorlevel% neq 0 echo Push failed.
