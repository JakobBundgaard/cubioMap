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
    soc = random.uniform(1, 3)
    cec = random.uniform(5, 15)
    texture_score = random.choice([0.8, 1.0, 1.2])
    ph = random.uniform(6, 7.5)
    soil_quality_value = (0.4 * soc) + (0.3 * cec) + (0.2 * texture_score) + (0.1 * ph)
    return soil_quality_value

# List til at samle værdier for normalisering
shannon_values, ndvi_values, soil_values = [], [], []

# Generer data først uden at skrive til fil for at indsamle værdier til normalisering
data = []
lat = start_lat
area_id = 1
while lat < end_lat:
    lng = start_lng
    while lng < end_lng:
        bounds = [[lat, lng], [lat + grid_size_lat, lng + grid_size_lng]]
        area_size = grid_size_lat * grid_size_lng * 111320 * 111320
        wkt_geom = f'POLYGON(({lng} {lat}, {lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat + grid_size_lat}, {lng + grid_size_lng} {lat}, {lng} {lat}))'
        
        # Generér Shannon Index, NDVI og jordkvalitet
        num_species = random.randint(3, 10)
        species_counts = [random.randint(1, 20) for _ in range(num_species)]
        shannon_index = calculate_shannon_index(species_counts)
        ndvi = random.uniform(0.3, 0.8)
        soil_quality_value = generate_soil_quality_index()
        
        shannon_values.append(shannon_index)
        ndvi_values.append(ndvi)
        soil_values.append(soil_quality_value)
        
        data.append([area_id, f"Cubio {area_id}", shannon_index, ndvi, soil_quality_value, area_size, wkt_geom])
        
        area_id += 1
        lng += grid_size_lng
    lat += grid_size_lat

# Normaliseringsfunktion
def normalize(value, min_value, max_value):
    return (value - min_value) / (max_value - min_value) if max_value > min_value else 0

# Find min og max for normalisering
min_shannon, max_shannon = min(shannon_values), max(shannon_values)
min_ndvi, max_ndvi = min(ndvi_values), max(ndvi_values)
min_soil, max_soil = min(soil_values), max(soil_values)

# Åbn CSV-fil til at skrive data
with open(output_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["id", "name", "nature_value", "shannon_index", "ndvi", "soil_quality_value", "area_size", "geom"])
    
    for row in data:
        area_id, name, shannon_index, ndvi, soil_quality_value, area_size, wkt_geom = row
        
        # Normaliser værdierne
        normalized_shannon = normalize(shannon_index, min_shannon, max_shannon)
        normalized_ndvi = normalize(ndvi, min_ndvi, max_ndvi)
        normalized_soil = normalize(soil_quality_value, min_soil, max_soil)
        
        # Beregn vægtet naturværdi-score
        nature_value = (0.4 * normalized_shannon) + (0.3 * normalized_ndvi) + (0.3 * normalized_soil)
        
        # Skriv række til CSV med normaliserede og vægtede værdier
        writer.writerow([area_id, name, round(nature_value, 4), round(normalized_shannon, 4),
                         round(normalized_ndvi, 4), round(normalized_soil, 4), round(area_size, 2), wkt_geom])

print(f"Data skrevet til {output_path}")
