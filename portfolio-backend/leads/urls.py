from django.urls import path

from .views import LeadCreateView

app_name = 'leads'

urlpatterns = [
    path('', LeadCreateView.as_view(), name='lead-create'),
]
