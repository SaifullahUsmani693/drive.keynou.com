from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.admin_serializers import AdminTableQuerySerializer, ProfileAccessUpdateSerializer, ProfileAdminSerializer
from accounts.models import Profile
from accounts.permissions import IsAdminUser
from accounts.services import list_profiles_for_tenant, update_profile_access
from common.responses import api_response


class AdminProfileListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tenant = request.tenant
        serializer = AdminTableQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        result = list_profiles_for_tenant(tenant=tenant, **serializer.validated_data)
        payload = {
            "items": ProfileAdminSerializer(result["items"], many=True).data,
            "page": result["page"],
            "page_size": result["page_size"],
            "total": result["total"],
            "pages": result["pages"],
        }
        return api_response(data=payload, message="Profiles fetched")


class AdminProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, profile_id: int):
        tenant = request.tenant
        profile = get_object_or_404(Profile, id=profile_id, tenant=tenant)
        serializer = ProfileAccessUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = dict(serializer.validated_data)
        if "subscription_expires_at" in validated and validated["subscription_expires_at"] is None:
            validated.pop("subscription_expires_at")
            validated["clear_subscription_expires_at"] = True
        updated = update_profile_access(profile=profile, **validated)
        return api_response(data=ProfileAdminSerializer(updated).data, message="Profile updated")
