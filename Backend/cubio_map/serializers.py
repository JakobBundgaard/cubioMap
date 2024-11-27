from rest_framework import serializers
from .models import Area, GBIFData, EnhancedCubioArea, Project, UserSelectedArea

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
    user_selected_area = serializers.PrimaryKeyRelatedField(queryset=UserSelectedArea.objects.all(), required=False)
    class Meta:
        model = Project
        fields = ['id', 'name', 'location', 'description', 'image', 'image_url', 'initiatedBy', 'user_selected_area']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class UserSelectedAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSelectedArea
        fields = ['id', 'name', 'nature_value', 'area_size', 'geom', 'user_id']
