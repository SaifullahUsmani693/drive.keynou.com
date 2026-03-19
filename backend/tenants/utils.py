from typing import Optional

from django.http import HttpRequest

from tenants.models import Tenant, TenantDomain


def resolve_tenant(request: HttpRequest) -> Optional[object]:
    host = request.get_host().split(":")[0].lower()
    if not host:
        return None
    try:
        domain = TenantDomain.objects.select_related("tenant").get(domain=host, is_verified=True)
    except TenantDomain.DoesNotExist:
        if host in {"localhost", "127.0.0.1"}:
            tenant = Tenant.objects.filter(is_active=True).first()
            if tenant:
                return tenant
            tenant, _ = Tenant.objects.get_or_create(
                slug="default",
                defaults={"name": "Default Tenant", "primary_domain": host, "is_active": True},
            )
            return tenant
        return None
    return domain.tenant
