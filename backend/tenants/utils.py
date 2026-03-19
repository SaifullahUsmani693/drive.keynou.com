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
            return Tenant.objects.filter(is_active=True).first()
        return None
    return domain.tenant
