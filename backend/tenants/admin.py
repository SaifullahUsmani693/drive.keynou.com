from django.contrib import admin

from tenants.models import Tenant, TenantDomain


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "primary_domain", "is_active")
    search_fields = ("name", "slug", "primary_domain")
    list_filter = ("is_active",)


@admin.register(TenantDomain)
class TenantDomainAdmin(admin.ModelAdmin):
    list_display = ("domain", "tenant", "is_primary", "is_verified", "verified_at")
    list_filter = ("is_primary", "is_verified")
    search_fields = ("domain", "tenant__name")
