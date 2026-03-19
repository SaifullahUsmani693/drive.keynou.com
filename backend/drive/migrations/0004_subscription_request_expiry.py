from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("drive", "0003_merge_20260320_0214"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscriptionrequest",
            name="subscription_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
