#!/usr/bin/env python
import os
import sys


def main():
    # Local (makemigrations/runserver) usa settings.dev por padrão.
    # Exporte DJANGO_SETTINGS_MODULE=config.settings.prod para produção.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            'Não foi possível importar o Django. Você ativou o virtualenv '
            'e instalou o requirements.txt?'
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
