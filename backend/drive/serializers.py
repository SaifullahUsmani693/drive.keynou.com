from rest_framework import serializers

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
    short_code = serializers.CharField(max_length=32, required=False, allow_blank=True)


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
    message = serializers.CharField()
