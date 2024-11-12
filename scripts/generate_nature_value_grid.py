import csv
import os
import random
import math

# Start- og slutkoordinater for et område med ca. 500 kvadrater
start_lat, end_lat = 56.35, 56.36  # Område på ca. 1 km i bredde (10 rækker)
start_lng, end_lng = 10.35, 10.4   # Område på ca. 5 km i længde (50 kolonner)

# Justér grid-størrelsen, så cellerne bliver mere kvadratiske
grid_size_lat = 0.001  # ca. 100 meter i breddegrader
grid_size_lng = 0.00175  # ca. 100 meter i længdegrader (justeret for at skabe kvadrater)

output_path = os.path.join(os.path.dirname(__file__), "cubio_map_data_with_nature_value.csv")

# Funktion til at beregne Shannon Diversity Index
def calculate_shannon_index(species_counts):
    total_observations = sum(species_counts)
    shannon_index = 0
    for count in species_counts:
        p_i = count / total_observations
        if p_i > 0:
            shannon_index -= p_i * math.log(p_i)
    return shannon_index

# Funktion til at generere dummy-data for jordkvalitetsværdi
def generate_soil_quality_index():
    # Dummy-værdier for SOC, CEC, tekstur og pH
    soc = random.uniform(1, 3)  # SOC-værdi mellem 1 og 3
    cec = random.uniform(5, 15)  # CEC-værdi mellem 5 og 15
    texture_score = random.choice([0.8, 1.0, 1.2])  # Tekstur-indeks
    ph = random.uniform(6, 7.5)  # pH-værdi mellem 6 og 7.5

    # Samlet jordkvalitetsværdi, vægtet
    soil_quality_value = (0.4 * soc) + (0.3 * cec) + (0.2 * texture_score) + (0.1 * ph)
    return soil_quality_value

# Åbn en CSV-fil til at skrive dataene
with open(output_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    # Skriv kolonneoverskrifterne
    writer.writerow(["id", "name", "nature_value", "shannon_index", "ndvi", "soil_quality_value", "area_size", "geom"])

    area_id = 1
    lat = start_lat
    while lat < end_lat:
        lng = start_lng
        while lng < end_lng:
            # Beregn sydvest og nordøst hjørner
            bounds = [[lat, lng], [lat + grid_size_lat, lng + grid_size_lng]]
            area_size = grid_size_lat * grid_size_lng * 111320 * 111320  # Ca. arealberegning i kvadratmeter

            # Opret en WKT-geometri for at beskrive kvadratet som en polygon
            wkt_geom = f'POLYGON(({lng} {lat}, {lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat}, {lng} {lat}))'

            # Dummy data for Shannon Index
            num_species = random.randint(3, 10)  # Antal arter i hver kvadrat
            species_counts = [random.randint(1, 20) for _ in range(num_species)]  # Observationer pr. art
            shannon_index = calculate_shannon_index(species_counts)

            # Dummy data for NDVI (Normaliseret vegetationsindeks)
            ndvi = random.uniform(0.3, 0.8)  # NDVI-værdier mellem 0.3 og 0.8

            # Dummy data for Jordkvalitetsværdi
            soil_quality_value = generate_soil_quality_index()

            # Beregn Naturværdi-score
            nature_value = (0.4 * shannon_index) + (0.3 * ndvi) + (0.3 * soil_quality_value)

            # Skriv række i CSV-filen med Shannon, NDVI, Jordkvalitet og Naturværdi
            writer.writerow([area_id, f"Cubio {area_id}", round(nature_value, 4), round(shannon_index, 4),
                             round(ndvi, 4), round(soil_quality_value, 4), round(area_size, 2), wkt_geom])

            area_id += 1
            lng += grid_size_lng
        lat += grid_size_lat

print(f"Data skrevet til {output_path}")