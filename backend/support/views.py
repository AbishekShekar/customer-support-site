from django.contrib.auth.models import User
from django.db.models import Count

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket, Conversation, Message
from .serializers import (
    TicketSerializer,
    ConversationSerializer,
    MessageSerializer,
    SupportAgentSerializer,
)


# =========================================================
# TICKET PERMISSIONS
# =========================================================

class IsAuthenticatedTicketPermission(permissions.BasePermission):
    """
    Authenticated users can:
    - View tickets
    - Create tickets

    Staff users can additionally:
    - Update tickets
    - Delete tickets
    - Assign tickets
    """

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # GET / HEAD / OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True

        # Customers can create tickets
        if request.method == "POST":
            return True

        # PATCH / PUT / DELETE require staff
        return request.user.is_staff


# =========================================================
# TICKET VIEWSET
# =========================================================

class TicketViewSet(viewsets.ModelViewSet):

    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticatedTicketPermission]

    def get_queryset(self):

        queryset = Ticket.objects.select_related(
            "customer",
            "assigned_to",
        ).all()

        # -------------------------------------------------
        # STAFF
        # -------------------------------------------------

        if self.request.user.is_staff:
            return queryset

        # -------------------------------------------------
        # CUSTOMER
        # -------------------------------------------------

        return queryset.filter(
            customer=self.request.user
        )

    def perform_create(self, serializer):

        # Always attach the logged-in user.
        # The customer cannot create a ticket
        # for another user.

        serializer.save(
            customer=self.request.user
        )

    # =====================================================
    # ASSIGN TICKET
    # =====================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="assign",
    )
    def assign(self, request, pk=None):

        # Only staff can assign tickets
        if not request.user.is_staff:
            return Response(
                {
                    "detail": (
                        "Only support staff can "
                        "assign tickets."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket = self.get_object()

        # Support dashboard currently sends agent_id.
        # We also accept user_id for backward compatibility.

        agent_id = (
            request.data.get("agent_id")
            or request.data.get("user_id")
        )

        if not agent_id:
            return Response(
                {
                    "detail": "agent_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            agent = User.objects.get(
                id=agent_id,
                is_staff=True,
                is_active=True,
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": "Support agent not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Assign agent
        ticket.assigned_to = agent

        # Automatically move ticket to In Progress
        ticket.status = Ticket.Status.IN_PROGRESS

        ticket.save(
            update_fields=[
                "assigned_to",
                "status",
                "updated_at",
            ]
        )

        return Response(
            TicketSerializer(
                ticket,
                context={
                    "request": request
                },
            ).data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# CONVERSATION VIEWSET
# =========================================================

class ConversationViewSet(viewsets.ModelViewSet):

    serializer_class = ConversationSerializer

    # -----------------------------------------------------
    # BASE QUERYSET
    # -----------------------------------------------------

    queryset = (
        Conversation.objects
        .select_related(
            "customer",
            "ticket",
        )
        .annotate(
            total_messages=Count("messages")
        )
        .order_by("-updated_at")
    )

    # =====================================================
    # CONVERSATION QUERYSET
    # =====================================================

    def get_queryset(self):

        queryset = (
            Conversation.objects
            .select_related(
                "customer",
                "ticket",
            )
            .annotate(
                total_messages=Count("messages")
            )
            .order_by("-updated_at")
        )

        # Optional status filter

        conversation_status = (
            self.request.query_params.get(
                "status"
            )
        )

        if conversation_status:
            queryset = queryset.filter(
                status=conversation_status
            )

        # -------------------------------------------------
        # STAFF
        # -------------------------------------------------

        if self.request.user.is_staff:
            return queryset

        # -------------------------------------------------
        # CUSTOMER
        # -------------------------------------------------

        return queryset.filter(
            customer=self.request.user
        )

    # =====================================================
    # CREATE CONVERSATION
    # =====================================================

    def perform_create(self, serializer):

        user = self.request.user

        # Customer information comes from JWT user.
        # The frontend does not control the identity.

        serializer.save(
            customer=user,
            customer_name=user.username,
            customer_email=user.email,
        )

    # =====================================================
    # SEND / GET MESSAGES
    # =====================================================

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="messages",
    )
    def messages(self, request, pk=None):

        conversation = self.get_object()

        # =================================================
        # GET MESSAGES
        # =================================================

        if request.method == "GET":

            messages = (
                conversation.messages
                .all()
                .order_by("created_at")
            )

            serializer = MessageSerializer(
                messages,
                many=True,
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        # =================================================
        # PREVENT MESSAGES IN CLOSED CHAT
        # =================================================

        if (
            conversation.status
            == Conversation.Status.CLOSED
        ):

            return Response(
                {
                    "detail": (
                        "This conversation is closed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # VALIDATE MESSAGE
        # =================================================

        body = request.data.get("body", "")
        body = body.strip()

        if not body:

            return Response(
                {
                    "detail": (
                        "Message body is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # DETERMINE SENDER
        # =================================================

        user = request.user

        if user.is_staff:

            sender_type = (
                Message.SenderType.AGENT
            )

        else:

            sender_type = (
                Message.SenderType.CUSTOMER
            )

        # =================================================
        # CREATE REAL MESSAGE
        # =================================================

        message = Message.objects.create(
            conversation=conversation,
            sender_type=sender_type,
            sender_name=user.username,
            body=body,
        )

        # =================================================
        # UPDATE CONVERSATION
        # =================================================

        conversation.save(
            update_fields=[
                "updated_at"
            ]
        )

        # =================================================
        # RETURN MESSAGE
        # =================================================

        serializer = MessageSerializer(
            message
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # =====================================================
    # CLOSE CONVERSATION
    # =====================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="close",
    )
    def close(self, request, pk=None):

        conversation = self.get_object()

        # Already closed

        if (
            conversation.status
            == Conversation.Status.CLOSED
        ):

            return Response(
                {
                    "message": (
                        "Conversation is already closed."
                    ),
                    "conversation_id": conversation.id,
                    "status": conversation.status,
                },
                status=status.HTTP_200_OK,
            )

        # Close conversation

        conversation.status = (
            Conversation.Status.CLOSED
        )

        conversation.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Conversation closed successfully."
                ),
                "conversation_id": conversation.id,
                "status": conversation.status,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# SUPPORT AGENTS
# =========================================================

class SupportAgentListView(APIView):

    permission_classes = [
        permissions.IsAdminUser
    ]

    def get(self, request):

        agents = (
            User.objects
            .filter(
                is_staff=True,
                is_active=True,
            )
            .order_by("username")
        )

        serializer = SupportAgentSerializer(
            agents,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# CURRENT USER
# =========================================================

class MeView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
            },
            status=status.HTTP_200_OK,
        )