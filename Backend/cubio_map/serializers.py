from rest_framework import serializers
from .models import Area, GBIFData, EnhancedCubioArea, Project, UserSelectedArea, AreaProject

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'nature_value', 'area_size', 'geom']

class EnhancedCubioAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnhancedCubioArea
        fields = '__all__'


class GBIFDataSerializer(serializers.ModelSerializer):  # Tilføj serializer for GBIFData
    class Meta:
        model = GBIFData
        fields = ['id', 'species', 'occurrence_date', 'coordinates', 'source_id']


class ProjectSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Project
        fields = ['id', 'name', 'location', 'description', 'image', 'image_url', 'initiatedBy']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class UserSelectedAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSelectedArea
        fields = ['id', 'name', 'nature_value', 'area_size', 'geom', 'user_id']

class AreaProjectSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AreaProject
        fields = ['id', 'name', 'description', 'area', 'image', 'image_url', 'initiated_by', 'status', 'date_initiated', 'expected_duration']

    def get_image_url(self, obj):
        request = self.context.get('request')  # Brug request-objektet til at bygge den fulde URL
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

