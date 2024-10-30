import json
import os

# Find den absolutte sti til JSON-filen
script_dir = os.path.dirname(__file__)  # Stien til scripts-mappen
file_path = os.path.join(script_dir, "djurslandGrid.json")  # Stien til djurslandGrid.json

# Udskriv stien for at tjekke den
print(f"Læser data fra: {file_path}")

# Kontroller, om filen findes
if not os.path.isfile(file_path):
    print("Fejl: Filen 'djurslandGrid.json' blev ikke fundet på denne sti.")
else:
    # Læs hele filen
    with open(file_path, "r") as f:
        data = json.load(f)

    # Tag de første 100 entries
    small_data = data[:1000]

    # Definer output-stien til frontend/src/data
    project_root = os.path.abspath(os.path.join(script_dir, "../frontend/src/data"))
    os.makedirs(project_root, exist_ok=True)  # Opret mappen, hvis den ikke findes
    output_path = os.path.join(project_root, "djurslandGrid_small.json")

    print(f"Skriver data til: {output_path}")

    # Gem data i JSON-filen
    with open(output_path, "w") as f:
        json.dump(small_data, f, indent=2)

    print("Generated 'djurslandGrid_small.json' with the first 1000 entries.")
