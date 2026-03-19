from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "tenant",
            "company_name",
            "subscription_active",
            "link_limit",
            "is_admin",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "tenant", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "profile"]


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
