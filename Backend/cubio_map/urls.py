from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, GBIFDataViewSet, EnhancedCubioAreaViewSet, ProjectViewSet, UserSelectedAreaViewSet, AreaProjectViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet)
router.register(r'gbif-data', GBIFDataViewSet)
router.register(r'enhanced-areas', EnhancedCubioAreaViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'user-selected-areas', UserSelectedAreaViewSet)
router.register(r'area-projects', AreaProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
