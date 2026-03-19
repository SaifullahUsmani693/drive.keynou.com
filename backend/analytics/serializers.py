from rest_framework import serializers


class AnalyticsSummarySerializer(serializers.Serializer):
    total_clicks = serializers.IntegerField()
    unique_links = serializers.IntegerField()
    top_links = serializers.ListField(child=serializers.DictField())
    recent_clicks = serializers.IntegerField()
