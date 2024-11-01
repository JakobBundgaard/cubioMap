import csv
import os
import random

# Start- og slutkoordinater for et område med ca. 500 kvadrater
start_lat, end_lat = 56.35, 56.36  # Område på ca. 1 km i bredde (10 rækker)
start_lng, end_lng = 10.35, 10.4   # Område på ca. 5 km i længde (50 kolonner)

# Justér grid-størrelsen, så cellerne bliver mere kvadratiske
grid_size_lat = 0.001  # ca. 100 meter i breddegrader
grid_size_lng = 0.00175  # ca. 100 meter i længdegrader (justeret for at skabe kvadrater)

output_path = os.path.join(os.path.dirname(__file__), "cubio_map_data.csv")

# Åbn en CSV-fil til at skrive dataene
with open(output_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    # Skriv kolonneoverskrifterne
    writer.writerow(["id", "name", "nature_value", "area_size", "geom"])

    area_id = 1
    lat = start_lat
    while lat < end_lat:
        lng = start_lng
        while lng < end_lng:
            # Beregn sydvest og nordøst hjørner
            bounds = [[lat, lng], [lat + grid_size_lat, lng + grid_size_lng]]
            nature_value = random.randint(50, 100)
            area_size = grid_size_lat * grid_size_lng * 111320 * 111320  # Ca. arealberegning i kvadratmeter

            # Opret en WKT-geometri for at beskrive kvadratet som en polygon
            wkt_geom = f'POLYGON(({lng} {lat}, {lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat}, {lng} {lat}))'

            # Skriv række i CSV-filen
            writer.writerow([area_id, f"Cubio {area_id}", nature_value, round(area_size, 2), wkt_geom])

            area_id += 1
            lng += grid_size_lng
        lat += grid_size_lat

print(f"Data skrevet til {output_path}")
