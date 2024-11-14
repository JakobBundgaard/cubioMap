from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, GBIFDataViewSet, EnhancedCubioAreaViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet)
router.register(r'gbif-data', GBIFDataViewSet)
router.register(r'enhanced-areas', EnhancedCubioAreaViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
