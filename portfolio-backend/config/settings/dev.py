from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Em desenvolvimento, libera explicitamente a origem padrão do Vite,
# além do que já vier configurado via .env.
CORS_ALLOWED_ORIGINS += [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
