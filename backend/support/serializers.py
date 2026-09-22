
from rest_framework import serializers
from .models import Ticket, Conversation, Message
from django.contrib.auth.models import User


class TicketSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    customer_name = serializers.CharField(
        source="customer.username",
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "customer",
            "customer_name",
            "order_id",
            "subject",
            "category",
            "description",
            "status",
            "assigned_to",
            "assigned_to_name",
            "resolution_note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "customer_name",
            "assigned_to_name",
            "created_at",
            "updated_at",
        ]
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender_type",
            "sender_name",
            "body",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "conversation",
            "sender_type",
            "sender_name",
            "created_at",
        ]
        


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(
        many=True,
        read_only=True
    )

    message_count = serializers.IntegerField(
        source="messages.count",
        read_only=True
    )

    customer_name = serializers.CharField(
        read_only=True
    )

    customer_email = serializers.EmailField(
        read_only=True
    )

    class Meta:
        model = Conversation

        fields = [
            "id",
            "customer",
            "ticket",
            "customer_name",
            "customer_email",
            "status",
            "created_at",
            "updated_at",
            "messages",
            "message_count",
        ]

        read_only_fields = [
            "id",
            "customer",
            "customer_name",
            "customer_email",
            "created_at",
            "updated_at",
            "messages",
            "message_count",
        ]
class SupportAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
        ]