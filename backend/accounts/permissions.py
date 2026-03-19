from rest_framework.permissions import BasePermission

from accounts.services import get_profile_for_user


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = get_profile_for_user(request.user)
        return bool(profile and profile.is_admin)
