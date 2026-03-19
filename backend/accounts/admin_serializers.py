from rest_framework import serializers

from accounts.models import Profile


class ProfileAccessUpdateSerializer(serializers.Serializer):
    subscription_active = serializers.BooleanField()
    link_limit = serializers.IntegerField(min_value=0)


class ProfileAdminSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "email",
            "tenant",
            "subscription_active",
            "link_limit",
            "is_admin",
            "created_at",
        ]
        read_only_fields = ["id", "user", "email", "tenant", "is_admin", "created_at"]
