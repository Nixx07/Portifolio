"""
Normalização e validação de número de WhatsApp brasileiro.

Fica em módulo separado (em vez de dentro de models.py) porque essa lógica
não é "sobre o Lead" — é uma regra de formatação de telefone que pode ser
reaproveitada em qualquer outro lugar do projeto no futuro (ex: um segundo
model, um comando de management, um teste isolado).
"""

import re

from django.core.exceptions import ValidationError

WHATSAPP_E164_REGEX = re.compile(r'^\+55\d{2}9?\d{8}$')

MENSAGEM_INVALIDO = 'Informe um WhatsApp válido, com DDD (ex: (11) 91234-5678).'


def normalizar_whatsapp(numero: str) -> str:
    """
    Remove toda formatação (espaços, parênteses, hífen, "+") de um número de
    WhatsApp brasileiro e devolve no formato E.164: "+55DDXXXXXXXXX".

    Aceita entradas como "(11) 91234-5678", "11912345678" ou "+5511912345678".
    """
    apenas_digitos = re.sub(r'\D', '', numero or '')

    # Remove o "55" inicial se já vier com o código do país, para não duplicar.
    if apenas_digitos.startswith('55') and len(apenas_digitos) > 11:
        apenas_digitos = apenas_digitos[2:]

    if len(apenas_digitos) not in (10, 11):
        raise ValidationError(MENSAGEM_INVALIDO)

    return f'+55{apenas_digitos}'


def validar_whatsapp_br(numero_normalizado: str) -> None:
    """Confere se um número já normalizado bate com o padrão brasileiro E.164."""
    if not WHATSAPP_E164_REGEX.match(numero_normalizado or ''):
        raise ValidationError(MENSAGEM_INVALIDO)
