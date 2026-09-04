"""
Garante que existe um superuser com as credenciais definidas nas variáveis
de ambiente DJANGO_SUPERUSER_USERNAME / _EMAIL / _PASSWORD.

Diferente do 'createsuperuser --noinput' padrão do Django (que falha se o
usuário já existir), este comando é idempotente: cria o usuário se não
existir, ou apenas garante is_staff/is_superuser e atualiza a senha se já
existir. Isso permite rodá-lo em todo boot do container (ver Dockerfile) e
também serve como forma de "resetar" a senha do superuser em produção: basta
mudar DJANGO_SUPERUSER_PASSWORD no Render e disparar um novo deploy.

Se as três variáveis não estiverem definidas, o comando não faz nada e sai
silenciosamente (importante para não quebrar boots locais/de dev que não
usam essas variáveis).
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Cria ou atualiza o superuser a partir de variáveis de ambiente."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write(
                "DJANGO_SUPERUSER_USERNAME/PASSWORD não definidos — pulando."
            )
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True},
        )

        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' criado."))
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Superuser '{username}' já existia — senha atualizada.")
            )
