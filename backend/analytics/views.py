from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from analytics.serializers import AnalyticsSummarySerializer
from analytics.services import analytics_summary
from common.responses import api_response


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant = request.tenant
        data = analytics_summary(tenant=tenant)
        serializer = AnalyticsSummarySerializer(data)
        return api_response(data=serializer.data, message="Analytics summary")
