from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_response
from tenants.models import TenantDomain
from tenants.serializers import (
    TenantBrandingSerializer,
    TenantDomainCreateSerializer,
    TenantDomainSerializer,
    TenantDomainVerifySerializer,
)
from tenants.services import create_domain, list_domains_for_tenant, verify_domain
from drive.services import invalidate_branding_cache


class DomainListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        domains = list_domains_for_tenant(tenant=tenant)
        serializer = TenantDomainSerializer(domains, many=True)
        return api_response(data=serializer.data, message="Domains fetched")

    def post(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        serializer = TenantDomainCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        domain = create_domain(tenant=tenant, **serializer.validated_data)
        return api_response(data=TenantDomainSerializer(domain).data, message="Domain added", status_code=201)


class DomainDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, domain_id: int):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        try:
            domain = TenantDomain.objects.get(id=domain_id, tenant=tenant)
        except TenantDomain.DoesNotExist:
            return api_response(message="Domain not found", status_code=404)
        domain.delete()
        return api_response(message="Domain removed")


class DomainVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, domain_id: int):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        try:
            domain = TenantDomain.objects.get(id=domain_id, tenant=tenant)
        except TenantDomain.DoesNotExist:
            return api_response(message="Domain not found", status_code=404)
        serializer = TenantDomainVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        success = verify_domain(
            domain_obj=domain,
            token=serializer.validated_data["token"],
            target_host=getattr(settings, "CUSTOM_DOMAIN_TARGET", "localhost"),
        )
        if not success:
            return api_response(message="Domain verification failed", status_code=400)
        return api_response(data=TenantDomainSerializer(domain).data, message="Domain verified")


class TenantBrandingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        serializer = TenantBrandingSerializer(tenant)
        return api_response(data=serializer.data, message="Tenant branding fetched")

    def patch(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)
        serializer = TenantBrandingSerializer(tenant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invalidate_branding_cache(tenant_id=tenant.id)
        return api_response(data=serializer.data, message="Tenant branding updated")
