FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# collectstatic e migrate rodam a cada boot (não em RUN, durante o build):
# em runtime o container já tem acesso a SECRET_KEY, DATABASE_URL e demais
# variáveis cadastradas no Render — que não existem no build (o .env fica
# de fora da imagem via .dockerignore, de propósito). Rodar aqui também evita
# expor segredos como ARG/ENV nas camadas da imagem. Ambos são idempotentes,
# então uma migration ou um static novo já entram em vigor sem passo manual.
# ensure_superuser (leads/management/commands) roda depois do migrate e é
# idempotente: cria o superuser na primeira vez, e nas próximas apenas
# atualiza a senha a partir de DJANGO_SUPERUSER_PASSWORD. É como "resetar"
# a senha em produção sem shell: muda a env var no Render e reimplanta.
CMD python manage.py collectstatic --noinput && python manage.py migrate --noinput && python manage.py ensure_superuser && gunicorn config.wsgi:application --bind 0.0.0.0:8000
