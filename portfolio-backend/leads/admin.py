from django.contrib import admin
from django.utils.html import format_html

from .models import Lead

STATUS_CORES = {
    Lead.Status.NOVO: '#c8102e',
    Lead.Status.EM_CONTATO: '#d97706',
    Lead.Status.CONVERTIDO: '#16a34a',
    Lead.Status.DESCARTADO: '#4c4e56',
}


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """
    Painel de gestão dos leads captados pelo portfólio. O lead nunca tem
    seus dados de submissão editados por aqui (são readonly) — o único
    campo que você de fato altera é o status do funil de negociação.
    """

    list_display = (
        'nome',
        'metodo_contato_badge',
        'contato_principal',
        'tipo_projeto',
        'status_badge',
        'criado_em',
    )
    list_filter = ('status', 'metodo_contato', 'tipo_projeto', 'orcamento_faixa')
    search_fields = ('nome', 'email', 'whatsapp', 'descricao')
    ordering = ('-criado_em',)
    date_hierarchy = 'criado_em'

    readonly_fields = (
        'id',
        'nome',
        'metodo_contato',
        'email',
        'whatsapp',
        'tipo_projeto',
        'descricao',
        'orcamento_faixa',
        'origem',
        'ip_address',
        'user_agent',
        'criado_em',
        'atualizado_em',
    )

    fieldsets = (
        ('Solicitação do lead', {
            'fields': (
                'id', 'nome', 'metodo_contato', 'email', 'whatsapp',
                'tipo_projeto', 'descricao', 'orcamento_faixa', 'origem',
            ),
        }),
        ('Gestão (você pode editar)', {
            'fields': ('status',),
        }),
        ('Auditoria antispam', {
            'fields': ('ip_address', 'user_agent', 'criado_em', 'atualizado_em'),
            'classes': ('collapse',),
        }),
    )

    actions = ['marcar_em_contato', 'marcar_convertido', 'marcar_descartado']

    @admin.display(description='Contato')
    def metodo_contato_badge(self, lead):
        icone = '✉' if lead.metodo_contato == Lead.ContactMethod.EMAIL else '↳'
        return format_html('{} {}', icone, lead.get_metodo_contato_display())

    @admin.display(description='Status')
    def status_badge(self, lead):
        cor = STATUS_CORES.get(lead.status, '#4c4e56')
        return format_html(
            '<span style="color:{}; font-weight:600;">●</span> {}',
            cor,
            lead.get_status_display(),
        )

    @admin.action(description='Marcar selecionados como "Em contato"')
    def marcar_em_contato(self, request, queryset):
        atualizados = queryset.update(status=Lead.Status.EM_CONTATO)
        self.message_user(request, f'{atualizados} lead(s) marcado(s) como "Em contato".')

    @admin.action(description='Marcar selecionados como "Convertido"')
    def marcar_convertido(self, request, queryset):
        atualizados = queryset.update(status=Lead.Status.CONVERTIDO)
        self.message_user(request, f'{atualizados} lead(s) marcado(s) como "Convertido".')

    @admin.action(description='Marcar selecionados como "Descartado"')
    def marcar_descartado(self, request, queryset):
        atualizados = queryset.update(status=Lead.Status.DESCARTADO)
        self.message_user(request, f'{atualizados} lead(s) marcado(s) como "Descartado".')
