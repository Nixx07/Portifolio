import os

from django.core.wsgi import get_wsgi_application

# Em produção real (gunicorn), a variável de ambiente DJANGO_SETTINGS_MODULE
# deve ser exportada explicitamente — este valor aqui é só o fallback seguro.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.prod')

application = get_wsgi_application()
