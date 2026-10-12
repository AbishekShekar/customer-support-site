
from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import (
    ConversationViewSet,
    MeView,
    RegisterView,
    SupportAgentListView,
    TicketViewSet,
    UserManagementDetailView,
    UserManagementView,
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
    path("users/", 
         UserManagementView.as_view(), 
         name="user-management"),

    path("users/<int:pk>/", 
         UserManagementDetailView.as_view(), 
         name="user-management-detail"),

    path("", 
         include(router.urls)),
]

urlpatterns += router.urls