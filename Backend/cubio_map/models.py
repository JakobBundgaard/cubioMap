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
    
    
class VegetationData(models.Model):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='vegetation_data')
    vegetation_index = models.DecimalField(max_digits=5, decimal_places=2)  # f.eks. NDVI værdi
    capture_date = models.DateField()  # dato for vegetationsmåling

    def __str__(self):
        return f"Vegetation index {self.vegetation_index} for {self.area.name} on {self.capture_date}"

