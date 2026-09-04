from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.views import LoginView, LogoutView
from django.core.cache import cache
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_POST

from .models import Lead
from .utils import obter_ip_cliente

# URL nomeada do login do dashboard — repetida nos decorators abaixo para
# que um usuário não autenticado seja mandado para *este* login (visual do
# site), nunca para o login padrão do Django Admin.
LOGIN_URL = 'dashboard:login'

# Bloqueio por força bruta: essa é a única porta de entrada pro dashboard,
# então é a superfície mais sensível do projeto (dá acesso a todos os
# leads). Sem isso, nada impedia um script de tentar milhares de senhas
# por minuto contra /dashboard/login/ — o Django LoginView puro não tem
# nenhum rate limit embutido.
LOGIN_MAX_TENTATIVAS = 5
LOGIN_JANELA_SEGUNDOS = 15 * 60


class DashboardLoginView(LoginView):
    """
    Login próprio do dashboard, com o template no mesmo visual do site.
    Só usuários staff conseguem passar do dashboard_home depois (ver
    abaixo) — mas qualquer conta autenticada consegue logar aqui; quem não
    é staff só vai bater num 403 na página seguinte.
    """

    template_name = 'leads/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return str(reverse_lazy('dashboard:home'))

    def _chave_cache(self):
        return f'dashboard-login-tentativas:{obter_ip_cliente(self.request)}'

    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            tentativas = cache.get(self._chave_cache(), 0)
            if tentativas >= LOGIN_MAX_TENTATIVAS:
                return HttpResponse(
                    'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
                    status=429,
                )
        return super().dispatch(request, *args, **kwargs)

    def form_invalid(self, form):
        chave = self._chave_cache()
        tentativas = cache.get(chave, 0) + 1
        cache.set(chave, tentativas, LOGIN_JANELA_SEGUNDOS)
        return super().form_invalid(form)

    def form_valid(self, form):
        # Login certo zera o contador — o limite é pra tentativa errada
        # repetida, não pra penalizar quem só demorou pra acertar a senha.
        cache.delete(self._chave_cache())
        return super().form_valid(form)


class DashboardLogoutView(LogoutView):
    next_page = reverse_lazy('dashboard:login')


@staff_member_required(login_url=LOGIN_URL)
def dashboard_home(request):
    """
    Painel único: leads pendentes (novo/em_contato) e resolvidos
    (convertido/descartado) lado a lado. Mesma fonte de dados do Admin —
    só uma forma diferente de olhar para o campo `status`.
    """
    pendentes = Lead.objects.filter(status__in=Lead.STATUSES_PENDENTES)
    resolvidos = Lead.objects.filter(status__in=Lead.STATUSES_RESOLVIDOS)
    return render(request, 'leads/dashboard.html', {
        'pendentes': pendentes,
        'resolvidos': resolvidos,
    })


@staff_member_required(login_url=LOGIN_URL)
@require_POST
def alternar_status_lead(request, pk):
    """
    Alterna um lead entre pendente e resolvido. POST-only (é uma mudança de
    estado, não uma leitura) e sempre redireciona de volta pro dashboard —
    sem JS, sem fetch: um <form> comum já resolve, e é o suficiente pro
    tamanho desta ferramenta.
    """
    lead = get_object_or_404(Lead, pk=pk)
    lead.alternar_status()
    return redirect('dashboard:home')
