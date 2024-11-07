from rest_framework import viewsets
from .models import Area, GBIFData, VegetationData
from .serializers import AreaSerializer, GBIFDataSerializer, VegetationDataSerializer

class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer


class GBIFDataViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = GBIFData.objects.all()
    serializer_class = GBIFDataSerializer


class VegetationDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VegetationData.objects.all()
    serializer_class = VegetationDataSerializer