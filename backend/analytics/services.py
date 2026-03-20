from datetime import timedelta
from functools import lru_cache
import ipaddress
import os
from pathlib import Path

from django.core.cache import cache
from django.db.models import Count
from django.utils import timezone

from analytics.models import ClickEvent, IP2LocationRange

try:
    import geoip2.database
except ImportError:  # pragma: no cover
    geoip2 = None


@lru_cache(maxsize=1)
def _geoip_reader():
    if geoip2 is None:
        return None
    db_path = os.getenv("GEOIP_DB_PATH", "")
    if not db_path:
        return None
    resolved = Path(db_path)
    if not resolved.exists():
        return None
    return geoip2.database.Reader(str(resolved))


def enrich_geo_from_ip(ip_address: str | None):
    if not ip_address:
        return {"country": "", "country_code": "", "region": "", "city": ""}
    ip2location = lookup_ip2location(ip_address)
    if ip2location:
        return ip2location
    reader = _geoip_reader()
    if reader is None:
        return {"country": "", "country_code": "", "region": "", "city": ""}
    try:
        response = reader.city(ip_address)
    except Exception:
        return {"country": "", "country_code": "", "region": "", "city": ""}
    return {
        "country": response.country.name or "",
        "country_code": response.country.iso_code or "",
        "region": response.subdivisions.most_specific.name or "",
        "city": response.city.name or "",
    }


def lookup_ip2location(ip_address: str):
    try:
        ip_int = int(ipaddress.ip_address(ip_address))
    except ValueError:
        return None
    record = (
        IP2LocationRange.objects.filter(start_ip__lte=ip_int, end_ip__gte=ip_int)
        .only("country", "country_code", "region", "city")
        .first()
    )
    if not record:
        return None
    return {
        "country": record.country or "",
        "country_code": record.country_code or "",
        "region": record.region or "",
        "city": record.city or "",
    }


def log_click_event(
    *,
    tenant=None,
    link=None,
    tenant_id=None,
    link_id=None,
    ip_address=None,
    user_agent="",
    referer="",
    country="",
    region="",
    city="",
):
    resolved_tenant_id = tenant_id or getattr(tenant, "id", None)
    resolved_link_id = link_id or getattr(link, "id", None)
    if resolved_tenant_id is None or resolved_link_id is None:
        raise ValueError("tenant/tenant_id and link/link_id are required")
    geo = enrich_geo_from_ip(ip_address)
    return ClickEvent.objects.create(
        tenant_id=resolved_tenant_id,
        link_id=resolved_link_id,
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer,
        country=country or geo["country"],
        country_code=geo.get("country_code", ""),
        region=region or geo["region"],
        city=city or geo["city"],
    )


def analytics_summary(*, tenant):
    cache_key = f"analytics:summary:{tenant.id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    since = timezone.now() - timedelta(days=7)
    total_clicks = ClickEvent.objects.filter(tenant=tenant).count()
    recent_clicks = ClickEvent.objects.filter(tenant=tenant, created_at__gte=since).count()
    unique_links = ClickEvent.objects.filter(tenant=tenant).values("link_id").distinct().count()
    top_links = (
        ClickEvent.objects.filter(tenant=tenant)
        .values("link_id", "link__short_code")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )
    country_counts = (
        ClickEvent.objects.filter(tenant=tenant)
        .exclude(country_code="")
        .values("country_code", "country")
        .annotate(total=Count("id"))
        .order_by("-total")
    )
    payload = {
        "total_clicks": total_clicks,
        "recent_clicks": recent_clicks,
        "unique_links": unique_links,
        "top_links": list(top_links),
        "country_counts": list(country_counts),
        "total_countries": len(country_counts),
    }
    cache.set(cache_key, payload, timeout=60)
    return payload
