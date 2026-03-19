from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.permissions import IsAdminUser
from common.responses import api_response
from drive.admin_serializers import SubscriptionRequestAdminSerializer, SubscriptionRequestAdminUpdateSerializer
from drive.models import SubscriptionRequest
from drive.services import list_subscription_requests_for_tenant, update_subscription_request


class AdminSubscriptionRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tenant = request.tenant
        requests = list_subscription_requests_for_tenant(tenant=tenant)
        serializer = SubscriptionRequestAdminSerializer(requests, many=True)
        return api_response(data=serializer.data, message="Requests fetched")


class AdminSubscriptionRequestUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, request_id: int):
        tenant = request.tenant
        request_obj = get_object_or_404(SubscriptionRequest, id=request_id, tenant=tenant)
        serializer = SubscriptionRequestAdminUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = update_subscription_request(request_obj=request_obj, **serializer.validated_data)
        return api_response(data=SubscriptionRequestAdminSerializer(updated).data, message="Request updated")
