from django.urls import path

from .views_dashboard import (
    DashboardLoginView,
    DashboardLogoutView,
    alternar_status_lead,
    dashboard_home,
)

# URLs do painel interno (server-rendered), completamente separadas de
# leads/urls.py (a API pública). Nunca compartilham namespace nem view —
# isso evita que uma alteração num endpoint vaze acidentalmente para o outro.
app_name = 'dashboard'

urlpatterns = [
    path('', dashboard_home, name='home'),
    path('login/', DashboardLoginView.as_view(), name='login'),
    path('logout/', DashboardLogoutView.as_view(), name='logout'),
    path('leads/<uuid:pk>/alternar-status/', alternar_status_lead, name='alternar-status'),
]
