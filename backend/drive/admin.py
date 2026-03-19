from django.contrib import admin

from drive.models import Link, SubscriptionRequest


@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    list_display = ("short_code", "tenant", "owner", "is_active", "created_at")
    list_filter = ("tenant", "is_active")
    search_fields = ("short_code", "destination_url", "owner__email")


@admin.register(SubscriptionRequest)
class SubscriptionRequestAdmin(admin.ModelAdmin):
    list_display = ("email", "tenant", "status", "created_at")
    list_filter = ("tenant", "status")
    search_fields = ("email", "name")
