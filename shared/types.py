# Shared types for both frontend and backend

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PixelData(BaseModel):
    x: int
    y: int
    color: str

class CanvasSection(BaseModel):
    x: int
    y: int
    pixels: List[PixelData]
    level: int

class PaintRequest(BaseModel):
    x: int
    y: int
    color: str

class ZoomRequest(BaseModel):
    level: int
    section_x: int
    section_y: int

# Canvas dimensions
TOTAL_SIZE = 729  # 729x729 = 531,441 pixels
SECTION_SIZE = 243  # 243x243 pixels per top-level section
SUBSECTION_SIZE = 81  # 81x81 pixels per level-2 subsection
AREA_SIZE = 27  # 27x27 pixels per level-3 area
# Additional derived levels
BLOCK_SIZE = 9  # level-4
CELL_SIZE = 3   # level-5

# Available colors
COLORS = [
    "red", "green", "blue", "yellow", "cyan", "magenta",
    "white", "black", "gray", "orange", "purple", "pink", "brown", "teal"
] 