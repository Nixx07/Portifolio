import time

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Lead
from .utils import obter_ip_cliente


class LeadSerializer(serializers.ModelSerializer):
    """
    Serializer "esguio" (skinny): não reimplementa nenhuma regra de negócio
    que já existe em `Lead.clean()` — apenas repassa os dados para o model
    (que roda `full_clean()`) e cuida das duas camadas de proteção antispam
    que fazem sentido aqui, na camada HTTP, e não dentro do model.
    """

    # Honeypot: campo que não existe visualmente para o usuário (fica
    # escondido via CSS no formulário React). Se vier preenchido, foi um
    # bot que também preencheu o input — descartamos a submissão.
    endereco = serializers.CharField(required=False, allow_blank=True, write_only=True)

    # Timestamp (epoch em segundos) de quando o formulário foi renderizado
    # no client, enviado pelo frontend junto com a submissão. Usado só para
    # medir o tempo mínimo de preenchimento.
    renderizado_em = serializers.FloatField(write_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'nome', 'metodo_contato', 'email', 'whatsapp',
            'tipo_projeto', 'descricao', 'orcamento_faixa',
            'endereco', 'renderizado_em',
        ]
        read_only_fields = ['id']

    TEMPO_MINIMO_SEGUNDOS = 2

    def validate_endereco(self, valor):
        if valor:
            # Não expomos ao bot que a rejeição foi por honeypot: o erro é
            # genérico, igual ao de qualquer outra falha de validação.
            raise serializers.ValidationError('Não foi possível enviar sua solicitação.')
        return valor

    def validate_renderizado_em(self, valor):
        if time.time() - valor < self.TEMPO_MINIMO_SEGUNDOS:
            raise serializers.ValidationError('Não foi possível enviar sua solicitação.')
        return valor

    def validate(self, dados):
        """
        Instancia um Lead temporário e roda `full_clean()` nele para
        reaproveitar a validação cruzada de email/whatsapp que já existe no
        model, em vez de duplicá-la aqui em forma de `if`s.
        """
        instancia = Lead(
            nome=dados.get('nome', ''),
            metodo_contato=dados.get('metodo_contato', ''),
            email=dados.get('email'),
            whatsapp=dados.get('whatsapp'),
            tipo_projeto=dados.get('tipo_projeto', ''),
            descricao=dados.get('descricao', ''),
            orcamento_faixa=dados.get('orcamento_faixa'),
        )
        try:
            instancia.full_clean(exclude=['id'])
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        # Devolve os valores já normalizados (ex: whatsapp formatado em
        # E.164) para que create() grave a versão canônica, não a bruta.
        dados['whatsapp'] = instancia.whatsapp
        dados['email'] = instancia.email
        return dados

    def create(self, dados_validados):
        dados_validados.pop('endereco', None)
        dados_validados.pop('renderizado_em', None)

        request = self.context.get('request')
        if request is not None:
            dados_validados['ip_address'] = obter_ip_cliente(request)
            dados_validados['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:255]

        return Lead.objects.create(**dados_validados)
