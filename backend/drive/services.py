import secrets

from django.core.cache import cache
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Count, Q

from accounts.models import Profile
from accounts.subscription import FREE_LINK_LIMIT, default_subscription_expiry
from drive.models import Link, SubscriptionRequest

RESOLVE_CACHE_TTL = 60 * 60


def _resolve_cache_key(*, short_code: str) -> str:
    return f"resolve:{short_code}"


def _branding_cache_key(*, tenant_id: int) -> str:
    return f"tenant:branding:{tenant_id}"


def get_cached_resolve(*, short_code: str):
    return cache.get(_resolve_cache_key(short_code=short_code))


def set_cached_resolve(*, short_code: str, payload: dict):
    cache.set(_resolve_cache_key(short_code=short_code), payload, timeout=RESOLVE_CACHE_TTL)


def invalidate_resolve_cache(*, short_code: str):
    cache.delete(_resolve_cache_key(short_code=short_code))


def get_cached_branding(*, tenant):
    cache_key = _branding_cache_key(tenant_id=tenant.id)
    cached = cache.get(cache_key)
    if cached:
        return cached
    is_paid = Profile.objects.filter(tenant=tenant, subscription_active=True).exists()
    payload = {
        "tenant_name": tenant.name,
        "is_paid": is_paid,
        "branding": {
            "logo_url": tenant.brand_logo_url,
            "primary_color": tenant.brand_primary_color,
            "text_color": tenant.brand_text_color,
        },
    }
    cache.set(cache_key, payload, timeout=RESOLVE_CACHE_TTL)
    return payload


def invalidate_branding_cache(*, tenant_id: int):
    cache.delete(_branding_cache_key(tenant_id=tenant_id))


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
        if "/" in cleaned:
            raise ValueError("Custom slug cannot contain '/'.")
        candidate = cleaned
        if len(candidate) > 255:
            raise ValueError("Custom alias is too long. Keep it under 255 characters.")
        return candidate
    return _generate_short_code()


def create_link(*, tenant, user, destination_url: str, short_code: str | None):
    profile, _ = Profile.objects.select_related("tenant").get_or_create(
        user=user,
        defaults={"tenant": tenant},
    )
    free_limit = FREE_LINK_LIMIT
    effective_limit = profile.link_limit if profile.subscription_active else free_limit

    link_count = Link.objects.filter(tenant=tenant, owner=user).count()
    if link_count >= effective_limit:
        if profile.subscription_active:
            raise ValueError("Link cap reached. Request a cap increase.")
        raise ValueError("Free cap reached. Contact support to increase your limit.")

    requested_code = _format_short_code(user=user, short_code=short_code)
    if Link.objects.filter(short_code=requested_code).exists():
        raise ValueError("Short link already exists. Choose a new alias.")

    with transaction.atomic():
        link = Link.objects.create(
            tenant=tenant,
            owner=user,
            destination_url=destination_url,
            short_code=requested_code,
        )
    invalidate_resolve_cache(short_code=requested_code)
    return link


def create_subscription_request(*, tenant, user, payload):
    return SubscriptionRequest.objects.create(
        tenant=tenant,
        user=user,
        name=payload["name"],
        email=payload["email"],
        phone=payload.get("phone", ""),
        requested_subscription=payload.get("requested_subscription", Profile.SUBSCRIPTION_TIER_LIMITED),
        message=payload["message"],
    )


def list_subscription_requests_for_tenant(
    *,
    tenant,
    page: int = 1,
    page_size: int = 10,
    search: str = "",
    ordering: str = "-created_at",
    status: str = "all",
    requested_subscription: str = "all",
):
    allowed_ordering = {
        "created_at": "created_at",
        "-created_at": "-created_at",
        "email": "email",
        "-email": "-email",
        "name": "name",
        "-name": "-name",
        "status": "status",
        "-status": "-status",
        "requested_subscription": "requested_subscription",
        "-requested_subscription": "-requested_subscription",
    }
    queryset = SubscriptionRequest.objects.filter(tenant=tenant).select_related("user", "user__profile").order_by(
        allowed_ordering.get(ordering, "-created_at")
    )
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(email__icontains=search)
            | Q(phone__icontains=search)
            | Q(message__icontains=search)
            | Q(user__email__icontains=search)
        )
    if status != "all":
        queryset = queryset.filter(status=status)
    if requested_subscription != "all":
        queryset = queryset.filter(requested_subscription=requested_subscription)

    paginator = Paginator(queryset, page_size)
    current_page = paginator.get_page(page)
    return {
        "items": list(current_page.object_list),
        "page": current_page.number,
        "page_size": page_size,
        "total": paginator.count,
        "pages": paginator.num_pages,
    }


def subscription_request_stats(*, tenant):
    return SubscriptionRequest.objects.filter(tenant=tenant).values("status").annotate(total=Count("id"))


def get_active_link(*, tenant, short_code: str):
    return Link.objects.select_related("tenant").get(tenant=tenant, short_code=short_code, is_active=True)


def update_link(*, tenant, user, link: Link, destination_url=None, short_code=None, is_active=None) -> Link:
    previous_code = link.short_code
    updates = {}
    if destination_url is not None:
        updates["destination_url"] = destination_url
    if is_active is not None:
        updates["is_active"] = is_active
    if short_code is not None:
        cleaned_code = _format_short_code(user=user, short_code=short_code)
        if cleaned_code != link.short_code and Link.objects.filter(short_code=cleaned_code).exists():
            raise ValueError("Short link already exists. Choose a new alias.")
        updates["short_code"] = cleaned_code

    if updates:
        for key, value in updates.items():
            setattr(link, key, value)
        link.save(update_fields=[*updates.keys(), "updated_at"])
        invalidate_resolve_cache(short_code=previous_code)
        invalidate_resolve_cache(short_code=link.short_code)
    return link


def delete_link(*, tenant, user, link_id: int) -> int:
    link = Link.objects.filter(id=link_id, tenant=tenant, owner=user).first()
    if link is None:
        return 0
    short_code = link.short_code
    deleted = link.delete()[0]
    invalidate_resolve_cache(short_code=short_code)
    return deleted


def bulk_delete_links(*, tenant, user, ids: list[int]) -> int:
    links = list(Link.objects.filter(id__in=ids, tenant=tenant, owner=user))
    if not links:
        return 0
    short_codes = [link.short_code for link in links]
    deleted = Link.objects.filter(id__in=ids, tenant=tenant, owner=user).delete()[0]
    for code in short_codes:
        invalidate_resolve_cache(short_code=code)
    return deleted


def update_subscription_request(
    *,
    request_obj,
    status: str | None = None,
    requested_subscription: str | None = None,
    assign_subscription: bool | None = None,
    assign_subscription_tier: str | None = None,
    assign_link_limit: int | None = None,
    admin_notes: str = "",
    subscription_expires_at=None,
    clear_subscription_expires_at: bool = False,
):
    update_fields = ["updated_at"]
    if status is not None:
        request_obj.status = status
        update_fields.append("status")
    request_obj.admin_notes = admin_notes
    update_fields.append("admin_notes")
    if requested_subscription is not None:
        request_obj.requested_subscription = requested_subscription
        update_fields.append("requested_subscription")
    if clear_subscription_expires_at:
        request_obj.subscription_expires_at = None
        update_fields.append("subscription_expires_at")
    elif subscription_expires_at is not None:
        request_obj.subscription_expires_at = subscription_expires_at
        update_fields.append("subscription_expires_at")

    if assign_subscription is not None and request_obj.user_id:
        profile, _ = Profile.objects.get_or_create(
            user=request_obj.user,
            defaults={"tenant": request_obj.tenant},
        )
        if assign_subscription:
            selected_tier = assign_subscription_tier or requested_subscription or request_obj.requested_subscription
            profile.subscription_active = selected_tier != Profile.SUBSCRIPTION_TIER_FREE
            profile.subscription_tier = selected_tier
            if assign_link_limit is not None:
                profile.link_limit = assign_link_limit
            if clear_subscription_expires_at:
                profile.subscription_expires_at = None
            elif subscription_expires_at is not None:
                profile.subscription_expires_at = subscription_expires_at
            elif selected_tier == Profile.SUBSCRIPTION_TIER_UNLIMITED:
                profile.subscription_expires_at = None
            else:
                profile.subscription_expires_at = default_subscription_expiry()
            profile.save(update_fields=["subscription_active", "subscription_tier", "link_limit", "subscription_expires_at", "updated_at"])
        else:
            profile.subscription_active = False
            profile.subscription_tier = Profile.SUBSCRIPTION_TIER_FREE
            profile.subscription_expires_at = None
            profile.link_limit = FREE_LINK_LIMIT
            profile.save(update_fields=["subscription_active", "subscription_tier", "subscription_expires_at", "updated_at"])

    request_obj.save(update_fields=list(dict.fromkeys(update_fields)))
    return request_obj
