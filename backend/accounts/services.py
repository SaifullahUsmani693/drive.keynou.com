from datetime import timedelta
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone

from accounts.models import Profile
from drive.models import SubscriptionRequest

User = get_user_model()


def get_profile_for_user(user):
    return Profile.objects.select_related("tenant").filter(user=user).first()


def list_profiles_for_tenant(
    *,
    tenant,
    page: int = 1,
    page_size: int = 10,
    search: str = "",
    ordering: str = "-created_at",
    subscription_status: str = "all",
    subscription_tier: str = "all",
):
    allowed_ordering = {
        "created_at": "created_at",
        "-created_at": "-created_at",
        "email": "user__email",
        "-email": "-user__email",
        "link_limit": "link_limit",
        "-link_limit": "-link_limit",
        "subscription_expires_at": "subscription_expires_at",
        "-subscription_expires_at": "-subscription_expires_at",
        "subscription_tier": "subscription_tier",
        "-subscription_tier": "-subscription_tier",
    }
    queryset = Profile.objects.filter(tenant=tenant).select_related("user").order_by(allowed_ordering.get(ordering, "-created_at"))

    if search:
        queryset = queryset.filter(
            Q(user__email__icontains=search)
            | Q(user__username__icontains=search)
            | Q(company_name__icontains=search)
        )

    now = timezone.now()
    in_seven_days = now + timedelta(days=7)
    if subscription_status == "active":
        queryset = queryset.filter(subscription_active=True).filter(
            Q(subscription_expires_at__isnull=True) | Q(subscription_expires_at__gte=now)
        )
    elif subscription_status == "inactive":
        queryset = queryset.filter(subscription_active=False)
    elif subscription_status == "expiring":
        queryset = queryset.filter(subscription_active=True, subscription_expires_at__gte=now, subscription_expires_at__lte=in_seven_days)
    elif subscription_status == "expired":
        queryset = queryset.filter(subscription_expires_at__lt=now)

    if subscription_tier != "all":
        queryset = queryset.filter(subscription_tier=subscription_tier)

    paginator = Paginator(queryset, page_size)
    current_page = paginator.get_page(page)
    items = list(current_page.object_list)
    user_ids = [item.user_id for item in items if item.user_id]
    latest_requests = {}
    if user_ids:
        request_rows = (
            SubscriptionRequest.objects.filter(tenant=tenant, user_id__in=user_ids)
            .order_by("user_id", "-created_at")
        )
        for request_obj in request_rows:
            latest_requests.setdefault(request_obj.user_id, request_obj)
    for item in items:
        item.latest_subscription_request = latest_requests.get(item.user_id)
    return {
        "items": items,
        "page": current_page.number,
        "page_size": page_size,
        "total": paginator.count,
        "pages": paginator.num_pages,
    }


def update_profile_access(
    *,
    profile,
    subscription_active: bool | None = None,
    subscription_tier: str | None = None,
    link_limit: int | None = None,
    subscription_expires_at=None,
    clear_subscription_expires_at: bool = False,
):
    update_fields = ["updated_at"]
    if subscription_active is not None:
        profile.subscription_active = subscription_active
        update_fields.append("subscription_active")
    if subscription_tier is not None:
        profile.subscription_tier = subscription_tier
        update_fields.append("subscription_tier")
    if link_limit is not None:
        profile.link_limit = link_limit
        update_fields.append("link_limit")
    if clear_subscription_expires_at:
        profile.subscription_expires_at = None
        update_fields.append("subscription_expires_at")
    elif subscription_expires_at is not None:
        profile.subscription_expires_at = subscription_expires_at
        update_fields.append("subscription_expires_at")
    if profile.subscription_tier == Profile.SUBSCRIPTION_TIER_FREE or not profile.subscription_active:
        profile.subscription_active = False
        profile.subscription_tier = Profile.SUBSCRIPTION_TIER_FREE
        profile.subscription_expires_at = None
        if "subscription_active" not in update_fields:
            update_fields.append("subscription_active")
        if "subscription_tier" not in update_fields:
            update_fields.append("subscription_tier")
        if "subscription_expires_at" not in update_fields:
            update_fields.append("subscription_expires_at")
    profile.save(update_fields=list(dict.fromkeys(update_fields)))
    return profile
