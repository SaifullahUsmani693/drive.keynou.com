from rest_framework import serializers

from drive.models import SubscriptionRequest


class SubscriptionRequestAdminUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["pending", "approved", "declined"])
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    subscription_expires_at = serializers.DateTimeField(required=False, allow_null=True)


class SubscriptionRequestAdminSerializer(serializers.ModelSerializer):
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
            "subscription_expires_at",
            "created_at",
        ]
        read_only_fields = ["id", "tenant", "user", "created_at"]
