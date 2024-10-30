import json
import os

# Start- og slutkoordinater for et område med ca. 500 kvadrater
start_lat, end_lat = 56.35, 56.36  # Område på ca. 1 km i bredde (10 rækker)
start_lng, end_lng = 10.35, 10.4   # Område på ca. 5 km i længde (50 kolonner)


# Justér grid-størrelsen, så cellerne bliver mere kvadratiske
grid_size_lat = 0.001  # ca. 100 meter i breddegrader
grid_size_lng = 0.00175  # ca. 100 meter i længdegrader (justeret for at skabe kvadrater)


grid_data = []
area_id = 1

lat = start_lat
while lat < end_lat:
    lng = start_lng
    while lng < end_lng:
        # Definer sydvest og nordøst hjørner for kvadratiske felter
        bounds = [[lat, lng], [lat + grid_size_lat, lng + grid_size_lng]]
        grid_data.append({
            "id": area_id,
            "name": f"Område {area_id}",
            "bounds": bounds
        })
        area_id += 1
        lng += grid_size_lng
    lat += grid_size_lat

# Definer output-stien til frontend/src/data
script_dir = os.path.dirname(__file__)
output_path = os.path.join(script_dir, "../frontend/src/data/djurslandGrid_small.json")

# Opret mappen, hvis den ikke findes
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Gem data som JSON
with open(output_path, "w") as f:
    json.dump(grid_data, f, indent=2)

print(f"Generated 'djurslandGrid_small.json' with {len(grid_data)} entries.")




# import json
# import os

# # Find den absolutte sti til JSON-filen
# script_dir = os.path.dirname(__file__)  # Stien til scripts-mappen
# file_path = os.path.join(script_dir, "djurslandGrid.json")  # Stien til djurslandGrid.json

# # Udskriv stien for at tjekke den
# print(f"Læser data fra: {file_path}")

# # Kontroller, om filen findes
# if not os.path.isfile(file_path):
#     print("Fejl: Filen 'djurslandGrid.json' blev ikke fundet på denne sti.")
# else:
#     # Læs hele filen
#     with open(file_path, "r") as f:
#         data = json.load(f)

#     # Tag de første 100 entries
#     small_data = data[:1000]

#     # Definer output-stien til frontend/src/data
#     project_root = os.path.abspath(os.path.join(script_dir, "../frontend/src/data"))
#     os.makedirs(project_root, exist_ok=True)  # Opret mappen, hvis den ikke findes
#     output_path = os.path.join(project_root, "djurslandGrid_small.json")

#     print(f"Skriver data til: {output_path}")

#     # Gem data i JSON-filen
#     with open(output_path, "w") as f:
#         json.dump(small_data, f, indent=2)

#     print("Generated 'djurslandGrid_small.json' with the first 1000 entries.")
