import sys
import os
import django
from datetime import datetime
from pygbif import occurrences
from django.contrib.gis.geos import Point


# Opsæt Django-miljø
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Importér modellen
from Backend.cubio_map.models import GBIFData  # Opdater til din app-sti, hvis nødvendigt

# Definer området for Djursland som en polygon i WKT-format
DJURSLAND_WKT = "POLYGON((10.5 56.3, 10.5 56.5, 10.7 56.5, 10.7 56.3, 10.5 56.3))"

def fetch_and_store_gbif_data():
    # Hent forekomster fra GBIF API for Djursland
    results = occurrences.search(geometry=DJURSLAND_WKT, limit=100)

    for record in results["results"]:
        species = record.get("species", "Ukendt")
        occurrence_date = record.get("eventDate")
        coordinates = record.get("decimalLongitude"), record.get("decimalLatitude")
        source_id = record.get("key")  # GBIF’s unikke ID

        # Konverter eventDate til en dato
        if occurrence_date:
            occurrence_date = datetime.strptime(occurrence_date, "%Y-%m-%dT%H:%M:%S")

        # Konverter koordinater til Point objekt
        if coordinates[0] is not None and coordinates[1] is not None:
            point = Point(coordinates)

            # Gem data i databasen, undgå dubletter baseret på source_id
            gbif_data, created = GBIFData.objects.get_or_create(
                source_id=source_id,
                defaults={
                    "species": species,
                    "occurrence_date": occurrence_date,
                    "coordinates": point,
                }
            )
            if created:
                print(f"Added {species} at {coordinates}")
            else:
                print(f"{species} at {coordinates} already exists")

if __name__ == "__main__":
    fetch_and_store_gbif_data()
