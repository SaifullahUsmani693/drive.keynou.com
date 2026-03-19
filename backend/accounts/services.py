from django.contrib.auth import get_user_model

from accounts.models import Profile

User = get_user_model()


def get_profile_for_user(user):
    return Profile.objects.select_related("tenant").get(user=user)
