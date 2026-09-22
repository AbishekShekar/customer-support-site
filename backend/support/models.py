
from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_tickets",
        null=True,
        blank=True,
    )

    order_id = models.CharField(max_length=48)
    subject = models.CharField(max_length=180)
    category = models.CharField(max_length=48)
    description = models.TextField()

    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.OPEN,
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )

    resolution_note = models.TextField(
        blank=True,
        default="",
        help_text="Explanation of the resolution or current progress.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"#{self.pk} {self.subject}"

    
class Conversation(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"

    customer = models.ForeignKey(
            User,
            on_delete=models.CASCADE,
            null=True,
            blank=True,
            related_name="support_conversations",
        )

    # A conversation can optionally be linked to a support ticket.
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations"
    )

    customer_name = models.CharField(max_length=120)
    customer_email = models.EmailField(blank=True)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
         return (
            f"Conversation #{self.pk} - "
            f"{self.customer_name}"
        )

class Message(models.Model):
    class SenderType(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        AGENT = "agent", "Agent"
        SYSTEM = "system", "System"

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender_type = models.CharField(
        max_length=10,
        choices=SenderType.choices
    )

    sender_name = models.CharField(max_length=120)
    body = models.TextField()

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message #{self.pk} in Conversation #{self.conversation_id}"