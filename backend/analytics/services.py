from datetime import timedelta

from django.core.cache import cache
from django.db.models import Count
from django.utils import timezone

from analytics.models import ClickEvent


def enrich_geo_from_ip(ip_address: str | None):
    if not ip_address:
        return {"country": "", "region": "", "city": ""}
    return {"country": "", "region": "", "city": ""}


def log_click_event(*, tenant, link, ip_address=None, user_agent="", referer="", country="", region="", city=""):
    geo = enrich_geo_from_ip(ip_address)
    return ClickEvent.objects.create(
        tenant=tenant,
        link=link,
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer,
        country=country or geo["country"],
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
    payload = {
        "total_clicks": total_clicks,
        "recent_clicks": recent_clicks,
        "unique_links": unique_links,
        "top_links": list(top_links),
    }
    cache.set(cache_key, payload, timeout=60)
    return payload
