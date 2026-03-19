from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from accounts.serializers import UserSerializer
from common.responses import api_response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(data=serializer.data, message="Profile fetched")
