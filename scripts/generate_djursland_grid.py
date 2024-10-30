import json

# Start- og slutkoordinater for Djursland
start_lat, end_lat = 56.30, 56.45
start_lng, end_lng = 10.3, 10.8
grid_size = 0.001  # ca. 100x100 meter kvadrater

grid_data = []
area_id = 1

lat = start_lat
while lat < end_lat:
    lng = start_lng
    while lng < end_lng:
        # Definer sydvest og nordøst hjørner
        bounds = [[lat, lng], [lat + grid_size, lng + grid_size]]
        grid_data.append({
            "id": area_id,
            "name": f"Område {area_id}",
            "bounds": bounds
        })
        area_id += 1
        lng += grid_size
    lat += grid_size

# Gem data som JSON
with open("djurslandGrid.json", "w") as f:
    json.dump(grid_data, f, indent=2)
