from django.http import HttpResponseRedirect
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from analytics.services import log_click_event
from common.responses import api_response
from drive.serializers import (
    LinkCreateSerializer,
    LinkSerializer,
    SubscriptionRequestCreateSerializer,
    SubscriptionRequestSerializer,
)
from drive.services import (
    create_link,
    create_subscription_request,
    get_active_link,
    list_links_for_user,
    list_subscription_requests_for_tenant,
)


class LinkListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.tenant
        links = list_links_for_user(tenant=tenant, user=request.user)
        serializer = LinkSerializer(links, many=True)
        return api_response(data=serializer.data, message="Links fetched")

    def post(self, request):
        tenant = request.tenant
        serializer = LinkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        link = create_link(tenant=tenant, user=request.user, **serializer.validated_data)
        return api_response(data=LinkSerializer(link).data, message="Link created", status_code=201)


class SubscriptionRequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.tenant
        requests = list_subscription_requests_for_tenant(tenant=tenant)
        serializer = SubscriptionRequestSerializer(requests, many=True)
        return api_response(data=serializer.data, message="Requests fetched")

    def post(self, request):
        tenant = request.tenant
        serializer = SubscriptionRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_obj = create_subscription_request(
            tenant=tenant,
            user=request.user,
            payload=serializer.validated_data,
        )
        return api_response(
            data=SubscriptionRequestSerializer(request_obj).data,
            message="Request submitted",
            status_code=201,
        )


class RedirectView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, short_code: str):
        tenant = request.tenant
        link = get_active_link(tenant=tenant, short_code=short_code)

        ip_address = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get(
            "REMOTE_ADDR"
        )
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        referer = request.META.get("HTTP_REFERER", "")

        log_click_event(
            tenant=tenant,
            link=link,
            ip_address=ip_address,
            user_agent=user_agent,
            referer=referer,
        )

        return HttpResponseRedirect(link.destination_url)
