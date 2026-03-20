from django.db import models
from django.utils import timezone


class ClickEvent(models.Model):
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="click_events")
    link = models.ForeignKey("drive.Link", on_delete=models.CASCADE, related_name="click_events")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referer = models.URLField(max_length=2000, blank=True)
    country = models.CharField(max_length=128, blank=True)
    country_code = models.CharField(max_length=8, blank=True)
    region = models.CharField(max_length=128, blank=True)
    city = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=["tenant", "created_at"]),
            models.Index(fields=["link", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.link_id} @ {self.created_at}"


class IP2LocationRange(models.Model):
    start_ip = models.BigIntegerField(db_index=True)
    end_ip = models.BigIntegerField(db_index=True)
    country_code = models.CharField(max_length=8, blank=True)
    country = models.CharField(max_length=128, blank=True)
    region = models.CharField(max_length=128, blank=True)
    city = models.CharField(max_length=128, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["start_ip", "end_ip"]),
        ]

    def __str__(self) -> str:
        return f"{self.start_ip}-{self.end_ip} {self.country_code}"
