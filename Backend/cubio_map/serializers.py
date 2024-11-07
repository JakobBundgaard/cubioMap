from rest_framework import serializers
from .models import Area, GBIFData, VegetationData

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'nature_value', 'area_size', 'geom']


class GBIFDataSerializer(serializers.ModelSerializer):  # Tilføj serializer for GBIFData
    class Meta:
        model = GBIFData
        fields = ['id', 'species', 'occurrence_date', 'coordinates', 'source_id']


class VegetationDataSerializer(serializers.ModelSerializer):
    area_name = serializers.CharField(source='area.name', read_only=True)

    class Meta:
        model = VegetationData
        fields = ['id', 'area', 'area_name', 'vegetation_index', 'capture_date']
