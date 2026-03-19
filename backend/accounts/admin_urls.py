from django.urls import path

from accounts.admin_views import AdminProfileListView, AdminProfileUpdateView

urlpatterns = [
    path("profiles/", AdminProfileListView.as_view(), name="admin-profiles"),
    path("profiles/<int:profile_id>/", AdminProfileUpdateView.as_view(), name="admin-profile-update"),
]
