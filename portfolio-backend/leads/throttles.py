from rest_framework.throttling import AnonRateThrottle


class LeadCreateThrottle(AnonRateThrottle):
    """
    Limita quantas solicitações um mesmo IP pode enviar ao endpoint público
    de criação de leads. A taxa em si não fica hardcoded aqui — vive em
    REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['lead-create']
    (config/settings/base.py), para ficar num único lugar visível.
    """
    scope = 'lead-create'
