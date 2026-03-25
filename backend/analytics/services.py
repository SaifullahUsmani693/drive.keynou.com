def get_client_ip(request):
    meta = getattr(request, "META", {}) or {}
    forwarded = meta.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        parts = [part.strip() for part in forwarded.split(",") if part.strip()]
        if parts:
            return parts[0]
    for header in ["HTTP_CF_CONNECTING_IP", "HTTP_X_REAL_IP", "HTTP_X_CLIENT_IP"]:
        candidate = meta.get(header, "").strip()
        if candidate:
            return candidate
    return meta.get("REMOTE_ADDR", "")
from datetime import timedelta
from functools import lru_cache
import ipaddress
import os
from django.core.cache import cache
from django.db.models import Count, Q
from django.utils import timezone

from analytics.models import ClickEvent, IP2LocationRange

DEFAULT_GEO_COUNTRY_CODE = os.getenv("DEFAULT_GEO_COUNTRY_CODE", "US")
DEFAULT_GEO_COUNTRY_NAME = os.getenv("DEFAULT_GEO_COUNTRY_NAME", "United States of America")
LOCAL_NETWORK_COUNTRY_CODE = os.getenv("LOCAL_NETWORK_COUNTRY_CODE", "LOCAL")
LOCAL_NETWORK_COUNTRY_NAME = os.getenv("LOCAL_NETWORK_COUNTRY_NAME", "Private Network")

COUNTRY_NAME_OVERRIDES = {
    "US": "United States of America",
    "USA": "United States of America",
    "UNITED STATES": "United States of America",
    "UNITED STATES OF AMERICA": "United States of America",
}


def normalize_country_code(country_code: str | None) -> str:
    return (country_code or "").upper()


def normalize_country_name(country: str | None, country_code: str | None) -> str:
    iso = normalize_country_code(country_code)
    upper_name = (country or "").upper()
    if iso and iso in COUNTRY_NAME_OVERRIDES:
        return COUNTRY_NAME_OVERRIDES[iso]
    if upper_name and upper_name in COUNTRY_NAME_OVERRIDES:
        return COUNTRY_NAME_OVERRIDES[upper_name]
    if country:
        return country
    if iso and iso in COUNTRY_NAME_OVERRIDES:
        return COUNTRY_NAME_OVERRIDES[iso]
    return DEFAULT_GEO_COUNTRY_NAME

def enrich_geo_from_ip(ip_address: str | None):
    fallback = {"country": "", "country_code": "", "region": "", "city": ""}
    if not ip_address:
        return fallback
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        ip_obj = None
    if ip_obj and (ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved):
        return {
            "country": "",
            "country_code": "",
            "region": "",
            "city": "",
        }
    ip2location = lookup_ip2location(ip_address)
    if ip2location:
        return ip2location
    return fallback


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


def is_local_ip(ip_address: str | None) -> bool:
    if not ip_address:
        return False
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return False
    return bool(ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved)


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
    geo_country_code = geo.get("country_code", "")
    geo_country = geo.get("country", "")
    resolved_country_code = normalize_country_code(country or geo_country_code)
    resolved_country = normalize_country_name(country or geo_country, resolved_country_code or geo_country_code)
    return ClickEvent.objects.create(
        tenant_id=resolved_tenant_id,
        link_id=resolved_link_id,
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer,
        country=resolved_country,
        country_code=resolved_country_code,
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
    local_ip_filters = Q(ip_address__startswith="127.") | Q(ip_address="::1") | Q(ip_address__startswith="10.") | Q(
        ip_address__startswith="192.168."
    ) | Q(ip_address__startswith="172.16.") | Q(ip_address__startswith="172.17.") | Q(
        ip_address__startswith="172.18."
    ) | Q(ip_address__startswith="172.19.") | Q(ip_address__startswith="172.2") | Q(ip_address__startswith="fd") | Q(
        ip_address__startswith="fc"
    )
    country_counts = (
        ClickEvent.objects.filter(tenant=tenant)
        .exclude(country_code="")
        .values("country_code", "country")
        .annotate(total=Count("id"))
        .order_by("-total")
    )
    local_blank_country_total = (
        ClickEvent.objects.filter(tenant=tenant)
        .filter(local_ip_filters)
        .filter(Q(country_code="") | Q(country_code__isnull=True))
        .count()
    )
    normalized_country_counts = []
    for item in country_counts:
        normalized_code = normalize_country_code(item.get("country_code")) or DEFAULT_GEO_COUNTRY_CODE
        normalized_name = normalize_country_name(item.get("country"), normalized_code)
        normalized_country_counts.append(
            {
                "country_code": normalized_code,
                "country": normalized_name,
                "total": item.get("total", 0),
            }
        )
    if local_blank_country_total:
        normalized_country_counts.append(
            {
                "country_code": LOCAL_NETWORK_COUNTRY_CODE,
                "country": LOCAL_NETWORK_COUNTRY_NAME,
                "total": local_blank_country_total,
            }
        )
    merged_country_counts = {}
    for item in normalized_country_counts:
        key = item["country_code"]
        if key not in merged_country_counts:
            merged_country_counts[key] = {
                "country_code": item["country_code"],
                "country": item["country"],
                "total": 0,
            }
        merged_country_counts[key]["total"] += item["total"]
    final_country_counts = sorted(merged_country_counts.values(), key=lambda item: item["total"], reverse=True)
    payload = {
        "total_clicks": total_clicks,
        "recent_clicks": recent_clicks,
        "unique_links": unique_links,
        "top_links": list(top_links),
        "country_counts": final_country_counts,
        "total_countries": len(final_country_counts),
    }
    cache.set(cache_key, payload, timeout=60)
    return payload
