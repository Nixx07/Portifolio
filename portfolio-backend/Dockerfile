FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic aqui builda o manifesto do WhiteNoise em tempo de build, não
# de boot: o container sobe mais rápido e o passo falha cedo (no build do
# Koyeb) se algum static estiver quebrado, em vez de falhar em produção.
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# migrate roda a cada boot: idempotente, e garante que uma migration nova
# aplicada no repo já entra em vigor sem precisar de um passo manual no
# Koyeb. Se a app crescer muito, isso pode virar um "release command"
# separado — não é necessário no tamanho atual do projeto.
CMD python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000
