from rest_framework import serializers
from .models import Area, GBIFData, EnhancedCubioArea, Project

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
    class Meta:
        model = Project
        fields = ['id', 'name', 'location', 'description', 'image', 'initiatedBy']