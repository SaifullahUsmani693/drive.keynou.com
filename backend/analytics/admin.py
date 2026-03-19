from django.contrib import admin

from analytics.models import ClickEvent


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ("tenant", "link", "ip_address", "created_at")
    list_filter = ("tenant",)
    search_fields = ("ip_address", "referer", "link__short_code")
