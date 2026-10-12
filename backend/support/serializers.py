from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Ticket, Conversation, Message


class TicketSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id", "customer", "customer_name", "order_id", "subject",
            "category", "description", "status", "assigned_to",
            "assigned_to_name", "resolution_note", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "customer", "customer_name", "assigned_to_name",
            "created_at", "updated_at",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and not request.user.is_staff:
            fields["status"].read_only = True
            fields["assigned_to"].read_only = True
            fields["resolution_note"].read_only = True
        return fields


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id", "conversation", "sender_type", "sender_name", "body",
            "is_read", "created_at",
        ]
        read_only_fields = [
            "id", "conversation", "sender_type", "sender_name", "created_at",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(source="messages.count", read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_email = serializers.EmailField(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id", "customer", "ticket", "customer_name", "customer_email",
            "status", "created_at", "updated_at", "messages", "message_count",
        ]
        read_only_fields = [
            "id", "customer", "customer_name", "customer_email", "created_at",
            "updated_at", "messages", "message_count",
        ]


class SupportAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        email = attrs.get("email", "")
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        return User.objects.create_user(**validated_data)


class ManagedUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_active", "date_joined"]
        read_only_fields = fields

    def get_role(self, user):
        if user.is_superuser:
            return "admin"
        if user.is_staff:
            return "support_agent"
        return "customer"


class CreateManagedUserSerializer(serializers.ModelSerializer):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("support_agent", "Support agent"),
        ("admin", "Admin"),
    )
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(**validated_data)
        if role == "support_agent":
            user.is_staff = True
        elif role == "admin":
            user.is_staff = True
            user.is_superuser = True
        user.save(update_fields=["is_staff", "is_superuser"])
        return user
