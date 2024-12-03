from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class Area(models.Model):
    name = models.CharField(max_length=100)
    nature_value = models.DecimalField(max_digits=5, decimal_places=2)
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.PolygonField()

    def __str__(self):
        return self.name
    

class EnhancedCubioArea(models.Model):
    name = models.CharField(max_length=100)
    nature_value = models.DecimalField(max_digits=5, decimal_places=4)
    shannon_index = models.DecimalField(max_digits=5, decimal_places=4)
    ndvi = models.DecimalField(max_digits=5, decimal_places=4)
    soil_quality_value = models.DecimalField(max_digits=5, decimal_places=4)
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.PolygonField(srid=4326)

    def __str__(self):
        return self.name


class GBIFData(models.Model):
    species = models.CharField(max_length=100)
    occurrence_date = models.DateField()
    coordinates = models.PointField()
    source_id = models.CharField(max_length=100, unique=True)  # For at undgå dubletter

    def __str__(self):
        return f"{self.species} at {self.coordinates}"

class Project(models.Model):
    name = models.CharField(max_length=100)
    location = models.PointField()  # Bruger PointField til at gemme lat/lng
    description = models.TextField()
    image = models.ImageField(upload_to='project_images/', blank=True, null=True)  # Billedupload
    initiatedBy = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class AreaProject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="projects")  # Relation til område
    image = models.ImageField(upload_to='area_project_images/', blank=True, null=True)
    initiated_by = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[('planned', 'Planned'), ('in_progress', 'In Progress'), ('completed', 'Completed')],
        default='planned'
    )
    date_initiated = models.DateField()
    expected_duration = models.PositiveIntegerField(help_text="Duration in days")

    def __str__(self):
        return f"{self.name} ({self.area.name})"

    
class UserSelectedArea(models.Model):
    name = models.CharField(max_length=100)
    nature_value = models.DecimalField(max_digits=5, decimal_places=4)
    area_size = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.MultiPolygonField(srid=4326)  # Valgfri geometri
    user_id = models.IntegerField()  # Brugertilpasning: Brugeren, der har gemt området

    def __str__(self):
        return self.name
