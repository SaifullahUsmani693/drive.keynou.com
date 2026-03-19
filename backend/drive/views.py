from django.http import HttpResponseRedirect
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from analytics.services import log_click_event
from common.responses import api_response
from drive.serializers import (
    LinkBulkDeleteSerializer,
    LinkCreateSerializer,
    LinkSerializer,
    LinkUpdateSerializer,
    SubscriptionRequestCreateSerializer,
    SubscriptionRequestSerializer,
)
from accounts.models import Profile
from drive.models import Link
from drive.services import (
    bulk_delete_links,
    create_link,
    create_subscription_request,
    delete_link,
    get_active_link,
    get_cached_branding,
    get_cached_resolve,
    list_links_for_user,
    list_subscription_requests_for_tenant,
    set_cached_resolve,
    update_link,
)
from tenants.models import Tenant


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
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return api_response(message="Authentication required", status_code=401)
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


class LinkDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, link_id: int):
        tenant = request.tenant
        link = Link.objects.filter(id=link_id, tenant=tenant, owner=request.user).first()
        if link is None:
            return api_response(message="Link not found", status_code=404)
        serializer = LinkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            updated = update_link(tenant=tenant, user=request.user, link=link, **serializer.validated_data)
        except ValueError as exc:
            return api_response(message=str(exc), status_code=400)
        return api_response(data=LinkSerializer(updated).data, message="Link updated")

    def delete(self, request, link_id: int):
        tenant = request.tenant
        deleted = delete_link(tenant=tenant, user=request.user, link_id=link_id)
        if deleted == 0:
            return api_response(message="Link not found", status_code=404)
        return api_response(message="Link deleted")


class LinkBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant = request.tenant
        serializer = LinkBulkDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deleted = bulk_delete_links(tenant=tenant, user=request.user, ids=serializer.validated_data["ids"])
        return api_response(data={"deleted": deleted}, message="Links deleted")


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


class PublicResolveView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, short_code: str):
        cached = get_cached_resolve(short_code=short_code)
        if cached:
            ip_address = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get(
                "REMOTE_ADDR"
            )
            user_agent = request.META.get("HTTP_USER_AGENT", "")
            referer = request.META.get("HTTP_REFERER", "")
            log_click_event(
                tenant_id=cached["tenant_id"],
                link_id=cached["link_id"],
                ip_address=ip_address,
                user_agent=user_agent,
                referer=referer,
            )
            cached_payload = cached.get("payload")
            if cached_payload:
                return api_response(data=cached_payload, message="Link resolved")
        link = (
            Link.objects.select_related("tenant")
            .filter(short_code=short_code, is_active=True, tenant__is_active=True)
            .first()
        )
        if link is None:
            return api_response(message="Link not found", status_code=404)

        tenant = link.tenant

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

        branding_payload = get_cached_branding(tenant=tenant)
        response_payload = {
            "destination_url": link.destination_url,
            "tenant_id": tenant.id,
            **branding_payload,
        }
        set_cached_resolve(
            short_code=short_code,
            payload={
                "tenant_id": tenant.id,
                "link_id": link.id,
                "payload": response_payload,
            },
        )
        return api_response(data=response_payload, message="Link resolved")
