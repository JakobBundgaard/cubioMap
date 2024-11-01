from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView

# Simpel test-API-view
class HelloWorld(APIView):
    def get(self, request):
        return Response({"message": "Hello, world!"})

# API URLConf
urlpatterns = [
    path('hello/', HelloWorld.as_view(), name='hello-world'),
]