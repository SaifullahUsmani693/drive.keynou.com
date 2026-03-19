from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.admin_serializers import ProfileAccessUpdateSerializer, ProfileAdminSerializer
from accounts.models import Profile
from accounts.permissions import IsAdminUser
from accounts.services import list_profiles_for_tenant, update_profile_access
from common.responses import api_response


class AdminProfileListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tenant = request.tenant
        profiles = list_profiles_for_tenant(tenant=tenant)
        serializer = ProfileAdminSerializer(profiles, many=True)
        return api_response(data=serializer.data, message="Profiles fetched")


class AdminProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, profile_id: int):
        tenant = request.tenant
        profile = get_object_or_404(Profile, id=profile_id, tenant=tenant)
        serializer = ProfileAccessUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = update_profile_access(profile=profile, **serializer.validated_data)
        return api_response(data=ProfileAdminSerializer(updated).data, message="Profile updated")
