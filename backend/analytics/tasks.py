from celery import shared_task

from analytics.services import log_click_event


@shared_task(bind=True, autoretry_for=(Exception,), retry_kwargs={"max_retries": 3, "countdown": 5})
def record_click_event_task(
    self,
    *,
    tenant_id: int | None = None,
    link_id: int | None = None,
    ip_address: str | None = None,
    user_agent: str = "",
    referer: str = "",
    country: str = "",
    region: str = "",
    city: str = "",
):
    """Asynchronously persist click analytics for a resolved short code."""

    log_click_event(
        tenant_id=tenant_id,
        link_id=link_id,
        ip_address=ip_address,
        user_agent=user_agent,
        referer=referer,
        country=country,
        region=region,
        city=city,
    )
