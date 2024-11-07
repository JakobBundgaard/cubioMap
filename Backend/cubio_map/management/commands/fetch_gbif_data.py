import os
import json
from django.core.management.base import BaseCommand
from cubio_map.models import GBIFData
from pygbif import occurrences
from django.contrib.gis.geos import Point
from datetime import datetime

class Command(BaseCommand):
    help = "Fetch GBIF data for Djursland grid cells"

    def handle(self, *args, **kwargs):
        from django.conf import settings
        
        # Path to grid data file
        grid_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'src', 'data', 'djurslandGrid_small.json')

        if not os.path.exists(grid_path):
            self.stdout.write(self.style.ERROR(f"Filen {grid_path} blev ikke fundet."))
            return

        with open(grid_path, "r") as f:
            grid_data = json.load(f)

        # Fetch and store data logic
        for cell in grid_data:
            bounds = cell["bounds"]
            DJURSLAND_WKT = f"POLYGON(({bounds[0][1]} {bounds[0][0]}, {bounds[1][1]} {bounds[0][0]}, {bounds[1][1]} {bounds[1][0]}, {bounds[0][1]} {bounds[1][0]}, {bounds[0][1]} {bounds[0][0]}))"

            results = occurrences.search(geometry=DJURSLAND_WKT, limit=100)

            for record in results["results"]:
                species = record.get("species", "Ukendt")
                occurrence_date = record.get("eventDate")
                coordinates = record.get("decimalLongitude"), record.get("decimalLatitude")
                source_id = record.get("key")

                # Hvis occurrence_date er None eller ugyldig, brug '1970-01-01'
                if occurrence_date:
                    try:
                        occurrence_date = datetime.strptime(occurrence_date, "%Y-%m-%dT%H:%M:%S")
                    except ValueError:
                        try:
                            occurrence_date = datetime.strptime(occurrence_date, "%Y-%m-%d")
                        except ValueError:
                            occurrence_date = datetime(1970, 1, 1)
                else:
                    occurrence_date = datetime(1970, 1, 1)

                # Konverter koordinater til et Point objekt og gem i databasen
                if coordinates[0] is not None and coordinates[1] is not None:
                    point = Point(coordinates)
                    gbif_data, created = GBIFData.objects.get_or_create(
                        source_id=source_id,
                        defaults={
                            "species": species,
                            "occurrence_date": occurrence_date,  # Brug '1970-01-01' som standarddato
                            "coordinates": point,
                        }
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Added {species} at {coordinates}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"{species} at {coordinates} already exists"))
