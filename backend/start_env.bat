@echo off
call .\env\Scripts\activate

start "Django Server" cmd /c "python manage.py runserver"
start "Celery Worker" cmd /c "celery -A config worker --loglevel=info --pool=solo"