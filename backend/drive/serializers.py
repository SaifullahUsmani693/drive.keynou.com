from rest_framework import serializers

from accounts.models import Profile
from drive.models import Link, SubscriptionRequest


class LinkSerializer(serializers.ModelSerializer):
    clicks = serializers.SerializerMethodField()

    def get_clicks(self, obj):
        return getattr(obj, "clicks", 0)

    class Meta:
        model = Link
        fields = [
            "id",
            "tenant",
            "owner",
            "short_code",
            "destination_url",
            "is_active",
            "created_at",
            "updated_at",
            "clicks",
        ]
        read_only_fields = ["id", "tenant", "owner", "created_at", "updated_at", "clicks"]


class LinkCreateSerializer(serializers.Serializer):
    destination_url = serializers.URLField(max_length=2000)
    short_code = serializers.CharField(max_length=255, required=False, allow_blank=True)


class LinkUpdateSerializer(serializers.Serializer):
    destination_url = serializers.URLField(max_length=2000, required=False)
    short_code = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)


class LinkBulkDeleteSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)


class SubscriptionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionRequest
        fields = [
            "id",
            "tenant",
            "user",
            "name",
            "email",
            "phone",
            "requested_subscription",
            "message",
            "status",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tenant", "user", "status", "admin_notes", "created_at", "updated_at"]


class SubscriptionRequestCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    requested_subscription = serializers.ChoiceField(choices=Profile.SUBSCRIPTION_TIER_CHOICES, required=False, default=Profile.SUBSCRIPTION_TIER_LIMITED)
    message = serializers.CharField()
