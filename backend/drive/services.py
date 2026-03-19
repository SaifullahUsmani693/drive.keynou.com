from django.db import transaction
from django.db.models import Count

from accounts.models import Profile
from drive.models import Link, SubscriptionRequest


def list_links_for_user(*, tenant, user):
    return Link.objects.filter(tenant=tenant, owner=user).order_by("-created_at")


def create_link(*, tenant, user, destination_url: str, short_code: str):
    profile = Profile.objects.select_related("tenant").get(user=user)

    if not profile.subscription_active:
        raise ValueError("Access is not enabled yet.")

    link_count = Link.objects.filter(tenant=tenant, owner=user).count()
    if link_count >= profile.link_limit:
        raise ValueError("Link cap reached. Request a cap increase.")

    with transaction.atomic():
        return Link.objects.create(
            tenant=tenant,
            owner=user,
            destination_url=destination_url,
            short_code=short_code,
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
