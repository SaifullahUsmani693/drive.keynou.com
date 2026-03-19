from django.urls import path

from analytics.views import AnalyticsSummaryView

urlpatterns = [
    path("summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
]
