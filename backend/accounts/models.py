from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="profiles")
    company_name = models.CharField(max_length=255, blank=True)
    subscription_active = models.BooleanField(default=False)
    link_limit = models.PositiveIntegerField(default=50)
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["tenant", "subscription_active"]),
            models.Index(fields=["tenant", "is_admin"]),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} ({self.tenant_id})"
