from django.urls import path

from tenants.views import DomainDetailView, DomainListCreateView, DomainVerifyView, TenantBrandingView

urlpatterns = [
    path("domains/", DomainListCreateView.as_view(), name="tenant-domains"),
    path("domains/<int:domain_id>/", DomainDetailView.as_view(), name="tenant-domain-detail"),
    path("domains/<int:domain_id>/verify/", DomainVerifyView.as_view(), name="tenant-domain-verify"),
    path("branding/", TenantBrandingView.as_view(), name="tenant-branding"),
]
