from rest_framework import serializers

from accounts.models import Profile


class ProfileAccessUpdateSerializer(serializers.Serializer):
    subscription_active = serializers.BooleanField(required=False)
    subscription_tier = serializers.ChoiceField(choices=Profile.SUBSCRIPTION_TIER_CHOICES, required=False)
    link_limit = serializers.IntegerField(min_value=0, required=False)
    subscription_expires_at = serializers.DateTimeField(required=False, allow_null=True)


class AdminTableQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(min_value=1, required=False, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=False, default=10)
    search = serializers.CharField(required=False, allow_blank=True, default="")
    ordering = serializers.CharField(required=False, allow_blank=True, default="-created_at")
    subscription_status = serializers.ChoiceField(
        choices=["all", "active", "inactive", "expiring", "expired"],
        required=False,
        default="all",
    )
    subscription_tier = serializers.ChoiceField(
        choices=[choice[0] for choice in Profile.SUBSCRIPTION_TIER_CHOICES] + ["all"],
        required=False,
        default="all",
    )


class ProfileAdminSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    requested_subscription = serializers.SerializerMethodField()
    active_request_id = serializers.SerializerMethodField()
    active_request_status = serializers.SerializerMethodField()
    active_request_notes = serializers.SerializerMethodField()

    def get_requested_subscription(self, obj):
        request_obj = getattr(obj, "latest_subscription_request", None)
        if request_obj is None:
            return ""
        return getattr(request_obj, "requested_subscription", "") or request_obj.message

    def get_active_request_id(self, obj):
        request_obj = getattr(obj, "latest_subscription_request", None)
        if request_obj is None:
            return None
        return request_obj.id

    def get_active_request_status(self, obj):
        request_obj = getattr(obj, "latest_subscription_request", None)
        if request_obj is None:
            return ""
        return request_obj.status

    def get_active_request_notes(self, obj):
        request_obj = getattr(obj, "latest_subscription_request", None)
        if request_obj is None:
            return ""
        return request_obj.admin_notes

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "email",
            "tenant",
            "subscription_active",
            "subscription_tier",
            "link_limit",
            "subscription_expires_at",
            "requested_subscription",
            "active_request_id",
            "active_request_status",
            "active_request_notes",
            "is_admin",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "email",
            "tenant",
            "requested_subscription",
            "active_request_id",
            "active_request_status",
            "active_request_notes",
            "is_admin",
            "created_at",
        ]
