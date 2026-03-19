import secrets
import socket
from typing import Iterable
from urllib.parse import urlparse

from django.utils import timezone

from tenants.models import Tenant, TenantDomain


def normalize_domain(domain: str) -> str:
    domain = domain.strip().lower()
    if domain.startswith("http://") or domain.startswith("https://"):
        parsed = urlparse(domain)
        domain = parsed.netloc
    else:
        parsed = urlparse(f"//{domain}")
        domain = parsed.netloc or domain
    return domain.split("/")[0].strip()


def list_domains_for_tenant(*, tenant: Tenant) -> Iterable[TenantDomain]:
    return TenantDomain.objects.filter(tenant=tenant).order_by("-created_at")


def create_domain(*, tenant: Tenant, domain: str, is_primary: bool = False) -> TenantDomain:
    domain = normalize_domain(domain)
    token = secrets.token_hex(16)
    return TenantDomain.objects.create(
        tenant=tenant,
        domain=domain,
        is_primary=is_primary,
        verification_token=token,
    )


def _resolve_ips(host: str) -> set[str]:
    addresses = set()
    for info in socket.getaddrinfo(host, None):
        addresses.add(info[4][0])
    return addresses


def verify_domain(*, domain_obj: TenantDomain, token: str, target_host: str) -> bool:
    if token != domain_obj.verification_token:
        return False
    try:
        domain_ips = _resolve_ips(domain_obj.domain)
        target_ips = _resolve_ips(target_host)
    except socket.gaierror:
        return False

    if not domain_ips or not target_ips or domain_ips.isdisjoint(target_ips):
        return False

    domain_obj.is_verified = True
    domain_obj.verified_at = timezone.now()
    domain_obj.save(update_fields=["is_verified", "verified_at"])
    return True
