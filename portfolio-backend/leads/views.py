from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from .serializers import LeadSerializer
from .throttles import LeadCreateThrottle


class LeadCreateView(CreateAPIView):
    """
    Único endpoint público desta app: recebe a submissão do modal "Quero
    meu site" e cria um Lead. Não existe list/retrieve/update/delete aqui
    de propósito — a leitura e a gestão dos leads acontecem exclusivamente
    pelo Django Admin, nunca pela API pública.
    """

    serializer_class = LeadSerializer
    permission_classes = [AllowAny]
    throttle_classes = [LeadCreateThrottle]
