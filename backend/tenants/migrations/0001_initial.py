from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Tenant",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("slug", models.SlugField(unique=True)),
                ("primary_domain", models.CharField(max_length=255, unique=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["slug"], name="tenants_tenant_slug_idx"),
                    models.Index(fields=["primary_domain"], name="tenants_tenant_primary_domain_idx"),
                    models.Index(fields=["is_active"], name="tenants_tenant_is_active_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="TenantDomain",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("domain", models.CharField(max_length=255, unique=True)),
                ("is_primary", models.BooleanField(default=False)),
                ("is_verified", models.BooleanField(default=False)),
                ("verification_token", models.CharField(blank=True, max_length=64)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "tenant",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="domains", to="tenants.tenant"),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["tenant", "domain"], name="tenants_domain_tenant_domain_idx"),
                    models.Index(fields=["is_verified"], name="tenants_domain_is_verified_idx"),
                ],
            },
        ),
    ]
