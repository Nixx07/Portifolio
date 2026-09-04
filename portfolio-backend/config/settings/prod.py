from .base import *  # noqa: F401, F403

DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Plataformas como o Koyeb fazem o TLS termination num proxy reverso na
# frente do container: a requisição chega ao Gunicorn em HTTP puro, com um
# cabeçalho X-Forwarded-Proto indicando que era HTTPS do lado de fora. Sem
# isso, o Django nunca reconhece a requisição como segura e
# SECURE_SSL_REDIRECT abaixo entra em loop infinito de redirect.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# Necessário no Django 4+ para qualquer POST vindo de HTTPS atrás de proxy
# (login e alternar-status do /dashboard/, ambos usam <form> com csrf_token).
# Mesma origem do backend no Koyeb — normalmente só um domínio aqui.
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS')
