from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [migrations.CreateModel(name="Ticket", fields=[
        ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
        ("order_id", models.CharField(max_length=48)),
        ("subject", models.CharField(max_length=180)),
        ("category", models.CharField(max_length=48)),
        ("description", models.TextField()),
        ("status", models.CharField(choices=[("open", "Open"), ("in_progress", "In progress"), ("resolved", "Resolved")], default="open", max_length=16)),
        ("created_at", models.DateTimeField(auto_now_add=True)),
        ("updated_at", models.DateTimeField(auto_now=True)),
    ], options={"ordering": ["-updated_at"]})]
