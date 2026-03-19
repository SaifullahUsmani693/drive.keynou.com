from rest_framework import serializers

from tenants.models import TenantDomain


class TenantDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantDomain
        fields = [
            "id",
            "domain",
            "is_primary",
            "is_verified",
            "verification_token",
            "verified_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "is_verified",
            "verification_token",
            "verified_at",
            "created_at",
        ]


class TenantDomainCreateSerializer(serializers.Serializer):
    domain = serializers.CharField(max_length=255)
    is_primary = serializers.BooleanField(default=False, required=False)


class TenantDomainVerifySerializer(serializers.Serializer):
    token = serializers.CharField(max_length=64)
