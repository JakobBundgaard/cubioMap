from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, GBIFDataViewSet, VegetationDataViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet)
router.register(r'gbif-data', GBIFDataViewSet)
router.register(r'vegetation-data', VegetationDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
