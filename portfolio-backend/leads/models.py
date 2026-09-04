import uuid

from django.core.exceptions import ValidationError
from django.db import models

from .validators import normalizar_whatsapp, validar_whatsapp_br


class Lead(models.Model):
    """
    Uma solicitação de orçamento recebida pelo botão "Quero meu site" do
    portfólio.

    Toda regra de negócio sobre o dado — validação cruzada de contato,
    normalização de telefone — vive aqui, no model. A API (serializers.py)
    e o Admin (admin.py) apenas leem e gravam este model; nenhum dos dois
    reimplementa essas regras. Se amanhã surgir um segundo formulário de
    captação em outro canal, ele também herda essa mesma garantia de
    integridade sem duplicar código.
    """

    class ContactMethod(models.TextChoices):
        EMAIL = 'email', 'E-mail'
        WHATSAPP = 'whatsapp', 'WhatsApp'

    class ProjectType(models.TextChoices):
        LANDING_PAGE = 'landing_page', 'Landing Page'
        SITE_INSTITUCIONAL = 'site_institucional', 'Site Institucional'
        ECOMMERCE = 'ecommerce', 'E-commerce'
        SISTEMA_WEB = 'sistema_web', 'Sistema Web'
        OUTRO = 'outro', 'Outro'

    class BudgetRange(models.TextChoices):
        ATE_2K = 'ate_2k', 'Até R$ 2.000'
        DE_2K_A_5K = 'de_2k_a_5k', 'R$ 2.000 – R$ 5.000'
        DE_5K_A_10K = 'de_5k_a_10k', 'R$ 5.000 – R$ 10.000'
        ACIMA_10K = 'acima_10k', 'Acima de R$ 10.000'
        NAO_SEI_AINDA = 'nao_sei_ainda', 'Ainda não sei'

    class Status(models.TextChoices):
        NOVO = 'novo', 'Novo'
        EM_CONTATO = 'em_contato', 'Em contato'
        CONVERTIDO = 'convertido', 'Convertido'
        DESCARTADO = 'descartado', 'Descartado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    nome = models.CharField(max_length=120, verbose_name='Nome')

    metodo_contato = models.CharField(
        max_length=10,
        choices=ContactMethod.choices,
        verbose_name='Método de contato preferido',
    )
    email = models.EmailField(blank=True, null=True, verbose_name='E-mail')
    whatsapp = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='WhatsApp',
        help_text='Armazenado normalizado no formato +55DDXXXXXXXXX.',
    )

    tipo_projeto = models.CharField(
        max_length=20,
        choices=ProjectType.choices,
        verbose_name='Tipo de projeto',
    )
    descricao = models.TextField(verbose_name='Descrição do projeto')
    orcamento_faixa = models.CharField(
        max_length=20,
        choices=BudgetRange.choices,
        blank=True,
        null=True,
        verbose_name='Faixa de orçamento',
    )

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.NOVO,
        verbose_name='Status',
    )
    origem = models.CharField(max_length=50, default='portfolio', verbose_name='Origem')

    # Auditoria antispam — nunca exibidos como "dado do lead", só como
    # rastro técnico da submissão.
    ip_address = models.GenericIPAddressField(blank=True, null=True, editable=False)
    user_agent = models.CharField(max_length=255, blank=True, null=True, editable=False)

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    # Agrupamento usado pelo dashboard customizado (leads/views_dashboard.py):
    # "Pendente"/"Resolvido" são uma leitura de alto nível sobre o mesmo
    # campo `status` acima — não duplicam estado em um campo novo. Manter
    # um único campo de status é o que garante que o Django Admin (que usa
    # os 4 valores originais) e o dashboard (que só enxerga 2 grupos)
    # nunca fiquem dessincronizados.
    STATUSES_PENDENTES = (Status.NOVO, Status.EM_CONTATO)
    STATUSES_RESOLVIDOS = (Status.CONVERTIDO, Status.DESCARTADO)

    class Meta:
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.nome} ({self.get_metodo_contato_display()})'

    @property
    def esta_resolvido(self) -> bool:
        return self.status in self.STATUSES_RESOLVIDOS

    def alternar_status(self):
        """
        Alterna o lead entre o funil aberto e resolvido, a partir do botão
        do dashboard. Pendente -> Resolvido sempre grava como CONVERTIDO;
        Resolvido -> Pendente sempre reabre como NOVO. Os estados
        intermediários (EM_CONTATO, DESCARTADO) continuam existindo e só
        são alcançados pelo Django Admin, para quem precisa da
        granularidade completa do funil.
        """
        # save() já roda full_clean() sozinho (ver definição abaixo) — não
        # precisa ser chamado de novo aqui.
        self.status = self.Status.NOVO if self.esta_resolvido else self.Status.CONVERTIDO
        self.save(update_fields=['status', 'atualizado_em'])

    def clean(self):
        """
        Validação cruzada: o campo correspondente ao método de contato
        escolhido é obrigatório; o outro é sempre limpo — nunca guardamos
        um dado que o formulário não pediu para aquele método.
        """
        super().clean()
        erros = {}

        if self.metodo_contato == self.ContactMethod.EMAIL:
            if not self.email:
                erros['email'] = 'Informe um e-mail, já que esse é o método de contato escolhido.'
            self.whatsapp = None

        elif self.metodo_contato == self.ContactMethod.WHATSAPP:
            if not self.whatsapp:
                erros['whatsapp'] = 'Informe um WhatsApp, já que esse é o método de contato escolhido.'
            else:
                try:
                    self.whatsapp = normalizar_whatsapp(self.whatsapp)
                    validar_whatsapp_br(self.whatsapp)
                except ValidationError as exc:
                    erros['whatsapp'] = exc.message
            self.email = None

        if erros:
            raise ValidationError(erros)

    def save(self, *args, **kwargs):
        """
        Garante que clean() sempre roda — mesmo se um Lead for criado fora
        de um ModelForm/Serializer (ex: um script de import, o shell do
        Django). A regra de negócio nunca pode ser contornada.
        """
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def contato_principal(self) -> str:
        """Valor de contato pronto para exibição, independente do método escolhido."""
        return self.email if self.metodo_contato == self.ContactMethod.EMAIL else self.whatsapp
