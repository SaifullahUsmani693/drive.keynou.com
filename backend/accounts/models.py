from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    SUBSCRIPTION_TIER_FREE = "free"
    SUBSCRIPTION_TIER_LIMITED = "limited"
    SUBSCRIPTION_TIER_CUSTOM = "custom"
    SUBSCRIPTION_TIER_UNLIMITED = "unlimited"
    SUBSCRIPTION_TIER_CHOICES = [
        (SUBSCRIPTION_TIER_FREE, "Free"),
        (SUBSCRIPTION_TIER_LIMITED, "Limited"),
        (SUBSCRIPTION_TIER_CUSTOM, "Custom"),
        (SUBSCRIPTION_TIER_UNLIMITED, "Unlimited"),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="profiles")
    company_name = models.CharField(max_length=255, blank=True)
    subscription_active = models.BooleanField(default=False)
    subscription_tier = models.CharField(max_length=20, choices=SUBSCRIPTION_TIER_CHOICES, default=SUBSCRIPTION_TIER_FREE)
    link_limit = models.PositiveIntegerField(default=50)
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["tenant", "subscription_active"]),
            models.Index(fields=["tenant", "subscription_tier"]),
            models.Index(fields=["tenant", "subscription_expires_at"]),
            models.Index(fields=["tenant", "is_admin"]),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} ({self.tenant_id})"
