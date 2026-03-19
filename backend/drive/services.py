import secrets

from django.db import transaction
from django.db.models import Count

from accounts.models import Profile
from drive.models import Link, SubscriptionRequest


def list_links_for_user(*, tenant, user):
    return (
        Link.objects.filter(tenant=tenant, owner=user)
        .annotate(clicks=Count("click_events"))
        .order_by("-created_at")
    )


def _generate_short_code() -> str:
    return secrets.token_urlsafe(6).replace("-", "").replace("_", "")[:8]


def _format_short_code(*, user, short_code: str | None) -> str:
    if short_code:
        cleaned = short_code.strip().replace(" ", "-")
        candidate = cleaned if "/" in cleaned else f"{user.id}/{cleaned}"
        if len(candidate) > 32:
            raise ValueError("Custom alias is too long. Keep it under 32 characters.")
        return candidate
    return _generate_short_code()


def create_link(*, tenant, user, destination_url: str, short_code: str | None):
    profile, _ = Profile.objects.select_related("tenant").get_or_create(
        user=user,
        defaults={"tenant": tenant},
    )
    free_limit = 2
    effective_limit = profile.link_limit if profile.subscription_active else free_limit

    link_count = Link.objects.filter(tenant=tenant, owner=user).count()
    if link_count >= effective_limit:
        if profile.subscription_active:
            raise ValueError("Link cap reached. Request a cap increase.")
        raise ValueError("Free cap reached. Contact support to increase your limit.")

    requested_code = _format_short_code(user=user, short_code=short_code)
    if Link.objects.filter(tenant=tenant, short_code=requested_code).exists():
        raise ValueError("Short link already exists. Choose a new alias.")

    with transaction.atomic():
        return Link.objects.create(
            tenant=tenant,
            owner=user,
            destination_url=destination_url,
            short_code=requested_code,
        )


def create_subscription_request(*, tenant, user, payload):
    return SubscriptionRequest.objects.create(
        tenant=tenant,
        user=user,
        name=payload["name"],
        email=payload["email"],
        phone=payload.get("phone", ""),
        message=payload["message"],
    )


def list_subscription_requests_for_tenant(*, tenant):
    return SubscriptionRequest.objects.filter(tenant=tenant).order_by("-created_at")


def subscription_request_stats(*, tenant):
    return SubscriptionRequest.objects.filter(tenant=tenant).values("status").annotate(total=Count("id"))


def get_active_link(*, tenant, short_code: str):
    return Link.objects.select_related("tenant").get(tenant=tenant, short_code=short_code, is_active=True)


def update_subscription_request(*, request_obj, status: str, admin_notes: str = ""):
    request_obj.status = status
    request_obj.admin_notes = admin_notes
    request_obj.save(update_fields=["status", "admin_notes", "updated_at"])
    return request_obj
