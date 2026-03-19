from django.contrib import admin

from accounts.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "tenant", "subscription_active", "link_limit", "is_admin")
    list_filter = ("tenant", "subscription_active", "is_admin")
    search_fields = ("user__email", "user__username", "tenant__name")
