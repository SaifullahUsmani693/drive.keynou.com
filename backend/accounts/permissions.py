from rest_framework.permissions import BasePermission

from accounts.services import get_profile_for_user


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = get_profile_for_user(request.user)
        return profile.is_admin
