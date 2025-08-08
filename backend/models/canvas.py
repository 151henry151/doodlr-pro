from typing import Dict, List, Tuple, Optional
from pydantic import BaseModel
from datetime import datetime

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

class CanvasModel:
    """Business logic for the hierarchical canvas system"""
    
    # Canvas dimensions (6-level system)
    TOTAL_SIZE = 729  # 729x729 = 531,441 pixels total
    LEVEL1_SECTION_SIZE = 243  # 243x243 pixels per Level 1 section
    LEVEL2_SECTION_SIZE = 81   # 81x81 pixels per Level 2 section
    LEVEL3_SECTION_SIZE = 27   # 27x27 pixels per Level 3 section
    LEVEL4_SECTION_SIZE = 9    # 9x9 pixels per Level 4 section
    LEVEL5_SECTION_SIZE = 3    # 3x3 pixels per Level 5 section
    # Level 6 is individual pixels (size = 1)
    
    # Available colors
    COLORS = [
        "red", "green", "blue", "yellow", "cyan", "magenta",
        "white", "black", "gray", "orange", "purple", "pink", "brown", "teal"
    ]
    
    @staticmethod
    def get_section_bounds(level: int, section_x: int, section_y: int) -> Tuple[int, int, int, int]:
        """Get the pixel bounds for a section at a given level"""
        if level == 1:
            # Level 1 - each section is 243x243 pixels
            start_x = section_x * CanvasModel.LEVEL1_SECTION_SIZE
            start_y = section_y * CanvasModel.LEVEL1_SECTION_SIZE
            end_x = start_x + CanvasModel.LEVEL1_SECTION_SIZE - 1
            end_y = start_y + CanvasModel.LEVEL1_SECTION_SIZE - 1
        elif level == 2:
            # Level 2 - each section is 81x81 pixels
            start_x = section_x * CanvasModel.LEVEL2_SECTION_SIZE
            start_y = section_y * CanvasModel.LEVEL2_SECTION_SIZE
            end_x = start_x + CanvasModel.LEVEL2_SECTION_SIZE - 1
            end_y = start_y + CanvasModel.LEVEL2_SECTION_SIZE - 1
        elif level == 3:
            # Level 3 - each section is 27x27 pixels
            start_x = section_x * CanvasModel.LEVEL3_SECTION_SIZE
            start_y = section_y * CanvasModel.LEVEL3_SECTION_SIZE
            end_x = start_x + CanvasModel.LEVEL3_SECTION_SIZE - 1
            end_y = start_y + CanvasModel.LEVEL3_SECTION_SIZE - 1
        elif level == 4:
            # Level 4 - each section is 9x9 pixels
            start_x = section_x * CanvasModel.LEVEL4_SECTION_SIZE
            start_y = section_y * CanvasModel.LEVEL4_SECTION_SIZE
            end_x = start_x + CanvasModel.LEVEL4_SECTION_SIZE - 1
            end_y = start_y + CanvasModel.LEVEL4_SECTION_SIZE - 1
        elif level == 5:
            # Level 5 - each section is 3x3 pixels
            start_x = section_x * CanvasModel.LEVEL5_SECTION_SIZE
            start_y = section_y * CanvasModel.LEVEL5_SECTION_SIZE
            end_x = start_x + CanvasModel.LEVEL5_SECTION_SIZE - 1
            end_y = start_y + CanvasModel.LEVEL5_SECTION_SIZE - 1
        else:
            # Level 6 - individual pixels
            start_x = section_x
            start_y = section_y
            end_x = start_x
            end_y = start_y
            
        return start_x, start_y, end_x, end_y
    
    @staticmethod
    def get_sections_for_level(level: int) -> List[Tuple[int, int]]:
        """Get all section coordinates for a given level
        Currently only used for level 1 to return the 3x3 top-level sections.
        """
        sections: List[Tuple[int, int]] = []
        
        if level == 1:
            # 3x3 grid of sections (243x243 each)
            for x in range(3):
                for y in range(3):
                    sections.append((x, y))
        else:
            # For other levels, callers compute sections differently
            pass
                    
        return sections
    
    @staticmethod
    def is_valid_pixel(x: int, y: int) -> bool:
        """Check if pixel coordinates are valid"""
        return 0 <= x < CanvasModel.TOTAL_SIZE and 0 <= y < CanvasModel.TOTAL_SIZE
    
    @staticmethod
    def is_valid_color(color: str) -> bool:
        """Check if color is valid"""
        return color in CanvasModel.COLORS 