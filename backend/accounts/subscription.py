from datetime import timedelta

from django.utils import timezone

FREE_LINK_LIMIT = 2
SUBSCRIPTION_EXTENSION_DAYS = 30


def default_subscription_expiry():
    return timezone.now() + timedelta(days=SUBSCRIPTION_EXTENSION_DAYS)
