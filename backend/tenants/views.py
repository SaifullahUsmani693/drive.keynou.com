import mimetypes
import os
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_response
from tenants.models import Tenant, TenantDomain
from tenants.serializers import (
    TenantBrandingSerializer,
    TenantDomainCreateSerializer,
    TenantDomainSerializer,
    TenantDomainVerifySerializer,
)
from tenants.services import create_domain, list_domains_for_tenant, verify_domain
from drive.services import invalidate_branding_cache

ALLOWED_LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"}
ALLOWED_LOGO_CONTENT_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "image/webp": ".webp",
}
MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


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


class TenantLogoUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        tenant = request.tenant
        if tenant is None:
            return api_response(message="Tenant not resolved", status_code=400)

        logo_file = request.FILES.get("logo")
        if logo_file is None:
            return api_response(message="No logo file provided", status_code=400)
        if logo_file.size > MAX_LOGO_SIZE_BYTES:
            return api_response(message="Logo file must be 5MB or smaller", status_code=400)

        content_type = logo_file.content_type or mimetypes.guess_type(logo_file.name)[0]
        extension = ALLOWED_LOGO_CONTENT_TYPES.get(content_type)
        if extension is None:
            _, ext = os.path.splitext(logo_file.name)
            ext = ext.lower()
            if ext in ALLOWED_LOGO_EXTENSIONS:
                extension = ext
        if extension is None:
            return api_response(message="Unsupported logo file type", status_code=400)

        filename = f"tenant-logos/{tenant.id}-{uuid4().hex}{extension}"
        saved_path = default_storage.save(filename, logo_file)
        logo_url = default_storage.url(saved_path)
        if logo_url.startswith("/"):
            logo_url = request.build_absolute_uri(logo_url)

        tenant.brand_logo_url = logo_url
        tenant.save(update_fields=["brand_logo_url", "updated_at"])
        invalidate_branding_cache(tenant_id=tenant.id)

        return api_response(data={"brand_logo_url": logo_url}, message="Logo uploaded")
