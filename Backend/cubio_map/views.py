from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Area, GBIFData, EnhancedCubioArea, Project, UserSelectedArea
from .serializers import AreaSerializer, GBIFDataSerializer, EnhancedCubioAreaSerializer, ProjectSerializer, UserSelectedAreaSerializer
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny


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

    def create(self, request, *args, **kwargs):
        print("FILES:", request.FILES)  # Debugging
        return super().create(request, *args, **kwargs)


class UserSelectedAreaViewSet(viewsets.ModelViewSet):
    queryset = UserSelectedArea.objects.all()
    serializer_class = UserSelectedAreaSerializer
    permission_classes = [AllowAny]  # Midlertidig, indtil autentifikation er på plads

    def create(self, request, *args, **kwargs):
        """
        Opret et nyt brugerdefineret område baseret på enten kvadrater eller tegnede polygoner.
        """
        geom_data = request.data.get('geom', None)
        user_id = request.data.get('user_id', None)
        name = request.data.get('name')
        nature_value = request.data.get('natureValue', 0)
        area_size = request.data.get('areaSize', 0)

        if not geom_data:
            return Response({"error": "No geometry provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Konverter geom_data til en GEOSGeometry-instans
            combined_geom = GEOSGeometry(geom_data)
            if combined_geom.geom_type not in ["Polygon", "MultiPolygon"]:
                return Response({"error": "Invalid geometry type"}, status=status.HTTP_400_BAD_REQUEST)

            # Konverter til MultiPolygon hvis nødvendigt
            if combined_geom.geom_type == "Polygon":
                combined_geom = MultiPolygon(combined_geom)

            # Generér et navn hvis det ikke er angivet
            if not name:
                existing_count = UserSelectedArea.objects.filter(user_id=user_id or 1).count() + 1
                name = f"Brugerdefineret område {existing_count}"
            # if not name:
            #     next_id = UserSelectedArea.objects.count() + 1
            #     name = f"Område {next_id}"

            # Gem det nye brugerdefinerede område
            user_area = UserSelectedArea.objects.create(
                name=name,
                nature_value=nature_value,
                area_size=area_size,
                geom=combined_geom,
                user_id=user_id or 1,  # Default user_id hvis ikke angivet
            )
            serializer = self.get_serializer(user_area)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def by_user(self, request, *args, **kwargs):
        """
        Hent alle gemte områder for en specifik bruger baseret på user_id.
        """
        user_id = request.query_params.get('user_id', 1)  # Default user_id = 1
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            areas = UserSelectedArea.objects.filter(user_id=user_id)
            serializer = self.get_serializer(areas, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_area(self, request, pk=None):
        """
        Slet et specifikt brugerdefineret område baseret på dets ID.
        """
        try:
            area = UserSelectedArea.objects.get(pk=pk)
            area.delete()
            return Response({"success": f"Area with ID {pk} deleted successfully"}, status=status.HTTP_200_OK)
        except UserSelectedArea.DoesNotExist:
            return Response({"error": f"Area with ID {pk} not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# class UserSelectedAreaViewSet(viewsets.ModelViewSet):
#     queryset = UserSelectedArea.objects.all()
#     serializer_class = UserSelectedAreaSerializer
#     permission_classes = [AllowAny]  # Midlertidig, indtil autentifikation er på plads

#     def create(self, request, *args, **kwargs):
#         geom_data = request.data.get('geom', None)
#         user_id = request.data.get('user_id', None)
#         name = request.data.get('name')
#         nature_value = request.data.get('natureValue', 0)
#         area_size = request.data.get('areaSize', 0)

#         if not geom_data:
#             return Response({"error": "No geometry provided"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Opret geometri som MultiPolygon
#             combined_geom = GEOSGeometry(geom_data)
#             if combined_geom.geom_type != "MultiPolygon":
#                 combined_geom = MultiPolygon(combined_geom)  # Konverter til MultiPolygon hvis nødvendigt

#             # Hvis navn ikke er angivet, generér det
#             if not name:
#                 next_id = UserSelectedArea.objects.count() + 1
#                 name = f"Område {next_id}"

#             # Gem det samlede område
#             user_area = UserSelectedArea.objects.create(
#                 name=name,
#                 nature_value=nature_value,
#                 area_size=area_size,
#                 geom=combined_geom,
#                 user_id=user_id or 1,  # Standard user_id hvis ikke angivet
#             )
#             serializer = self.get_serializer(user_area)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['get'])
#     def by_user(self, request, *args, **kwargs):
#         """
#         Hent alle gemte områder for en specifik bruger baseret på user_id.
#         """
#         user_id = request.query_params.get('user_id', 1)  # Default user_id = 1
#         if not user_id:
#             return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             areas = UserSelectedArea.objects.filter(user_id=user_id)
#             serializer = self.get_serializer(areas, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
