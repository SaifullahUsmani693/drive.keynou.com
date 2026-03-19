from django.urls import path

from drive.views import LinkListCreateView, RedirectView, SubscriptionRequestListCreateView

urlpatterns = [
    path("links/", LinkListCreateView.as_view(), name="link-list-create"),
    path("subscription-requests/", SubscriptionRequestListCreateView.as_view(), name="subscription-request-list-create"),
    path("r/<str:short_code>/", RedirectView.as_view(), name="redirect"),
]
