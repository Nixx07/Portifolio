from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/leads/', include('leads.urls', namespace='leads')),
    path('dashboard/', include('leads.urls_dashboard', namespace='dashboard')),
]
