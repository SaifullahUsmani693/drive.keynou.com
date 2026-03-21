from rest_framework import serializers
from accounts.models import Profile
from drive.models import SubscriptionRequest


class SubscriptionRequestAdminQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(min_value=1, required=False, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=100, required=False, default=10)
    search = serializers.CharField(required=False, allow_blank=True, default="")
    ordering = serializers.CharField(required=False, allow_blank=True, default="-created_at")
    status = serializers.ChoiceField(choices=["all", "pending", "approved", "declined"], required=False, default="all")
    requested_subscription = serializers.ChoiceField(
        choices=[choice[0] for choice in Profile.SUBSCRIPTION_TIER_CHOICES] + ["all"],
        required=False,
        default="all",
    )


class SubscriptionRequestAdminUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["pending", "approved", "declined"], required=False)
    requested_subscription = serializers.ChoiceField(choices=Profile.SUBSCRIPTION_TIER_CHOICES, required=False)
    assign_subscription = serializers.BooleanField(required=False)
    assign_subscription_tier = serializers.ChoiceField(choices=Profile.SUBSCRIPTION_TIER_CHOICES, required=False)
    assign_link_limit = serializers.IntegerField(min_value=0, required=False)
    subscription_expires_at = serializers.DateTimeField(required=False, allow_null=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)


class SubscriptionRequestAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    current_subscription_tier = serializers.SerializerMethodField()
    current_subscription_active = serializers.SerializerMethodField()
    current_subscription_expires_at = serializers.SerializerMethodField()

    def get_current_subscription_tier(self, obj):
        profile = getattr(getattr(obj, "user", None), "profile", None)
        return getattr(profile, "subscription_tier", None)

    def get_current_subscription_active(self, obj):
        profile = getattr(getattr(obj, "user", None), "profile", None)
        return getattr(profile, "subscription_active", False)

    def get_current_subscription_expires_at(self, obj):
        profile = getattr(getattr(obj, "user", None), "profile", None)
        return getattr(profile, "subscription_expires_at", None)

    class Meta:
        model = SubscriptionRequest
        fields = [
            "id",
            "tenant",
            "user",
            "user_email",
            "name",
            "email",
            "phone",
            "requested_subscription",
            "message",
            "status",
            "admin_notes",
            "subscription_expires_at",
            "current_subscription_tier",
            "current_subscription_active",
            "current_subscription_expires_at",
            "created_at",
        ]
        read_only_fields = ["id", "tenant", "user", "created_at"]
