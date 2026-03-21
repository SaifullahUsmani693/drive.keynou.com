from django.contrib import admin

from analytics.models import ClickEvent, IP2LocationRange


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ("tenant", "link", "ip_address", "country_code", "created_at")
    list_filter = ("tenant", "country_code")
    search_fields = ("ip_address", "referer", "link__short_code")


@admin.register(IP2LocationRange)
class IP2LocationRangeAdmin(admin.ModelAdmin):
    list_display = ("start_ip", "end_ip", "country_code", "country")
    list_filter = ("country_code",)
    search_fields = ("country_code", "country")
