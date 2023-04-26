import argparse
import shutil
import re
from pathlib import Path

parser = argparse.ArgumentParser()

parser.add_argument("path")

args = parser.parse_args()

tile_dir = Path(args.path) / 'AWBWApp.Resources' / 'Textures' / 'Map' / 'AW2'

exclude = ["Pipe", "River", "Road", "Sea", "Shoal"]

for entry in tile_dir.iterdir():
    if entry.is_dir():
        co = entry.name

        if co not in exclude:
            for entry in entry.iterdir():
                name = re.sub(r'^([^\-]+\-)', "\\1" + co + "-", entry.name.replace("_", "-")).lower()
                entry.rename(entry.with_name(name))
