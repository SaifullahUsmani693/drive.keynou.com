from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("drive", "0001_initial"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="link",
            name="uniq_tenant_short_code",
        ),
        migrations.AlterField(
            model_name="link",
            name="short_code",
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
