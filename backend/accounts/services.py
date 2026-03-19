from django.contrib.auth import get_user_model

from accounts.models import Profile

User = get_user_model()


def get_profile_for_user(user):
    return Profile.objects.select_related("tenant").get(user=user)


def list_profiles_for_tenant(*, tenant):
    return Profile.objects.filter(tenant=tenant).select_related("user").order_by("-created_at")


def update_profile_access(*, profile, subscription_active: bool, link_limit: int):
    profile.subscription_active = subscription_active
    profile.link_limit = link_limit
    profile.save(update_fields=["subscription_active", "link_limit", "updated_at"])
    return profile
