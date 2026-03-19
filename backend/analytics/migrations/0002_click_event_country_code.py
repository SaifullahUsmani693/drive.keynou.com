from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analytics", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="clickevent",
            name="country_code",
            field=models.CharField(blank=True, max_length=8),
        ),
    ]
