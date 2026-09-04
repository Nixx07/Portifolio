"""
Utilidades compartilhadas entre a API pública (views.py/serializers.py) e o
dashboard interno (views_dashboard.py) — não pertence a nenhum dos dois de
propósito.
"""


def obter_ip_cliente(request) -> str:
    """
    IP real do visitante, mesmo atrás do proxy reverso do Koyeb.

    Em produção, toda requisição chega ao Gunicorn já passada pelo proxy da
    plataforma: `REMOTE_ADDR` nesse cenário é sempre o IP interno do proxy,
    não do cliente — usar `REMOTE_ADDR` direto faria todo o tráfego cair no
    mesmo "balde" de rate limit (um único abuso trava todo mundo) e
    inutilizaria o campo de auditoria em Lead.ip_address.

    O proxy escreve o IP original como primeiro valor de X-Forwarded-For;
    times pegamos apenas esse primeiro valor. Confiável porque o único jeito
    de a requisição chegar ao container é passando por esse proxy — o
    Django nunca fala diretamente com a internet aqui.
    """
    encaminhado = request.META.get('HTTP_X_FORWARDED_FOR')
    if encaminhado:
        return encaminhado.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
