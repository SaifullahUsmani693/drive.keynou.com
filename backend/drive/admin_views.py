from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.permissions import IsAdminUser
from common.responses import api_response
from drive.admin_serializers import (
    SubscriptionRequestAdminQuerySerializer,
    SubscriptionRequestAdminSerializer,
    SubscriptionRequestAdminUpdateSerializer,
)
from drive.models import SubscriptionRequest
from drive.services import list_subscription_requests_for_tenant, update_subscription_request


class AdminSubscriptionRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tenant = request.tenant
        serializer = SubscriptionRequestAdminQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        result = list_subscription_requests_for_tenant(tenant=tenant, **serializer.validated_data)
        payload = {
            "items": SubscriptionRequestAdminSerializer(result["items"], many=True).data,
            "page": result["page"],
            "page_size": result["page_size"],
            "total": result["total"],
            "pages": result["pages"],
        }
        return api_response(data=payload, message="Requests fetched")


class AdminSubscriptionRequestUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, request_id: int):
        tenant = request.tenant
        request_obj = get_object_or_404(SubscriptionRequest, id=request_id, tenant=tenant)
        serializer = SubscriptionRequestAdminUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = dict(serializer.validated_data)
        if "subscription_expires_at" in validated and validated["subscription_expires_at"] is None:
            validated.pop("subscription_expires_at")
            validated["clear_subscription_expires_at"] = True
        updated = update_subscription_request(request_obj=request_obj, **validated)
        return api_response(data=SubscriptionRequestAdminSerializer(updated).data, message="Request updated")
