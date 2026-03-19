from django.urls import path

from drive.views import (
    LinkBulkDeleteView,
    LinkDetailView,
    LinkListCreateView,
    PublicResolveView,
    RedirectView,
    SubscriptionRequestListCreateView,
)

urlpatterns = [
    path("links/", LinkListCreateView.as_view(), name="link-list-create"),
    path("links/bulk-delete/", LinkBulkDeleteView.as_view(), name="link-bulk-delete"),
    path("links/<int:link_id>/", LinkDetailView.as_view(), name="link-detail"),
    path("subscription-requests/", SubscriptionRequestListCreateView.as_view(), name="subscription-request-list-create"),
    path("resolve/<int:tenant_id>/<path:short_code>/", PublicResolveView.as_view(), name="public-resolve"),
    path("r/<path:short_code>/", RedirectView.as_view(), name="redirect"),
]
