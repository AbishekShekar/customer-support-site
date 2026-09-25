
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

        from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })

        if User.objects.filter(
            username=attrs["username"]
        ).exists():
            raise serializers.ValidationError({
                "username": "Username already exists."
            })

        if User.objects.filter(
            email=attrs["email"]
        ).exists():
            raise serializers.ValidationError({
                "email": "Email already exists."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user