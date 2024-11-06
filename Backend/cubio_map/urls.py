from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, GBIFDataViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet)
router.register(r'gbif-data', GBIFDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
