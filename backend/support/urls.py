
from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import TicketViewSet, ConversationViewSet
from .views import (
    TicketViewSet,
    ConversationViewSet,
    SupportAgentListView,
    MeView,
    RegisterView,
)


router = DefaultRouter()

router.register(
    "tickets", 
    TicketViewSet, 
    basename="ticket"
)

router.register(
    "conversations",
    ConversationViewSet,
    basename="conversation"
)

urlpatterns = [
    path(
        "support-agents/",
        SupportAgentListView.as_view(),
        name="support-agents"
    ),
    path(
        "me/",
        MeView.as_view(),
        name="me"
    ),
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),
]

urlpatterns += router.urls