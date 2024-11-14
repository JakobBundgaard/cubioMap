from rest_framework import viewsets
from .models import Area, GBIFData, EnhancedCubioArea, Project
from .serializers import AreaSerializer, GBIFDataSerializer, EnhancedCubioAreaSerializer, ProjectSerializer

class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

class EnhancedCubioAreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnhancedCubioArea.objects.all()
    serializer_class = EnhancedCubioAreaSerializer


class GBIFDataViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = GBIFData.objects.all()
    serializer_class = GBIFDataSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer