from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class Area(models.Model):
    name = models.CharField(max_length=100)
    nature_value = models.DecimalField(max_digits=5, decimal_places=2)
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.PolygonField()

    def __str__(self):
        return self.name
    

class GBIFData(models.Model):
    species = models.CharField(max_length=100)
    occurrence_date = models.DateField()
    coordinates = models.PointField()
    source_id = models.CharField(max_length=100, unique=True)  # For at undgå dubletter

    def __str__(self):
        return f"{self.species} at {self.coordinates}"

