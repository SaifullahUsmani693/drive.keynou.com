from django.db import models
from django.utils import timezone


class Tenant(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    primary_domain = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    brand_logo_url = models.URLField(max_length=2000, blank=True)
    brand_primary_color = models.CharField(max_length=32, blank=True)
    brand_text_color = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["primary_domain"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:
        return self.name


class TenantDomain(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="domains")
    domain = models.CharField(max_length=255, unique=True)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=["tenant", "domain"]), models.Index(fields=["is_verified"])]

    def __str__(self) -> str:
        return self.domain
