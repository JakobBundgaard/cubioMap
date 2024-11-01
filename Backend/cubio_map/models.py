from django.contrib.gis.db import models

class Area(models.Model):
    name = models.CharField(max_length=100)
    nature_value = models.DecimalField(max_digits=5, decimal_places=2)
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.PolygonField()

    def __str__(self):
        return self.name

