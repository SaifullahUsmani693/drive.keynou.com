from django.urls import path

from drive.admin_views import AdminSubscriptionRequestListView, AdminSubscriptionRequestUpdateView

urlpatterns = [
    path("subscription-requests/", AdminSubscriptionRequestListView.as_view(), name="admin-subscription-requests"),
    path("subscription-requests/<int:request_id>/", AdminSubscriptionRequestUpdateView.as_view(), name="admin-subscription-request-update"),
]
