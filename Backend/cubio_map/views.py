from rest_framework import viewsets
from .models import Area, GBIFData, EnhancedCubioArea, Project
from .serializers import AreaSerializer, GBIFDataSerializer, EnhancedCubioAreaSerializer, ProjectSerializer, UserSelectedAreaSerializer

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


from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import UserSelectedArea
from .serializers import UserSelectedAreaSerializer

class UserSelectedAreaViewSet(viewsets.ModelViewSet):
    queryset = UserSelectedArea.objects.all()
    serializer_class = UserSelectedAreaSerializer

    def create(self, request, *args, **kwargs):
        areas = request.data.get('areas', [])
        user_id = request.data.get('user_id', None)  # Hent bruger-id fra forespørgslen
        if not areas:
            return Response({"error": "No areas provided"}, status=status.HTTP_400_BAD_REQUEST)

        created_areas = []
        for area in areas:
            area_data = {
                "name": area['name'],
                "nature_value": area['natureValue'],
                "area_size": area['areaSize'],
                "geom": area.get('geom', None),
                "user_id": user_id or 1,  # Brug default user_id, hvis det ikke gives
            }
            serializer = self.get_serializer(data=area_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            created_areas.append(serializer.data)

        return Response(created_areas, status=status.HTTP_201_CREATED)
