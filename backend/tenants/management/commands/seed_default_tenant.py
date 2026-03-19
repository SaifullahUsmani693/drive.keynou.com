from django.core.management.base import BaseCommand

from tenants.models import Tenant, TenantDomain


class Command(BaseCommand):
    help = "Seed a default tenant + domain for local development."

    def handle(self, *args, **options):
        tenant, _ = Tenant.objects.get_or_create(
            slug="default",
            defaults={"name": "Default Tenant", "primary_domain": "localhost", "is_active": True},
        )
        TenantDomain.objects.get_or_create(
            tenant=tenant,
            domain="localhost",
            defaults={"is_primary": True, "is_verified": True},
        )
        self.stdout.write(self.style.SUCCESS("Default tenant seeded"))
