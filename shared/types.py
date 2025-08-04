"""
Shared type definitions for the Doodlr app.
These types are used by both frontend and backend.
"""

from typing import List, Optional, Dict, Any
from enum import Enum

class Color(Enum):
    """Standard color palette for the canvas."""
    RED = "#FF0000"
    GREEN = "#00FF00"
    BLUE = "#0000FF"
    YELLOW = "#FFFF00"
    CYAN = "#00FFFF"
    MAGENTA = "#FF00FF"
    WHITE = "#FFFFFF"
    BLACK = "#000000"
    GRAY = "#808080"
    ORANGE = "#FFA500"
    PURPLE = "#800080"
    PINK = "#FFC0CB"
    BROWN = "#A52A2A"
    LIME = "#00FF00"
    TEAL = "#008080"

class CanvasLevel(Enum):
    """Represents the depth level of the canvas."""
    LEVEL_1 = 1  # Main canvas (9 squares)
    LEVEL_2 = 2  # Second level (81 squares)
    LEVEL_3 = 3  # Third level (729 squares)
    LEVEL_4 = 4  # Fourth level (6561 squares) - paintable level

class Position:
    """Represents a position in the canvas hierarchy."""
    def __init__(self, x: int, y: int, level: CanvasLevel):
        self.x = x
        self.y = y
        self.level = level
    
    def __str__(self):
        return f"Position({self.x}, {self.y}, level={self.level.value})"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "x": self.x,
            "y": self.y,
            "level": self.level.value
        }

class CanvasSquare:
    """Represents a square in the canvas."""
    def __init__(self, position: Position, color: Optional[str] = None, is_zoomable: bool = True):
        self.position = position
        self.color = color
        self.is_zoomable = is_zoomable  # Can this square be zoomed into?
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "position": self.position.to_dict(),
            "color": self.color,
            "is_zoomable": self.is_zoomable
        }

class CanvasState:
    """Represents the current state of the canvas."""
    def __init__(self, squares: List[CanvasSquare]):
        self.squares = squares
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "squares": [square.to_dict() for square in self.squares]
        }

class UserAction:
    """Represents a user action on the canvas."""
    def __init__(self, user_id: str, action_type: str, position: Position, color: Optional[str] = None):
        self.user_id = user_id
        self.action_type = action_type  # "zoom" or "paint"
        self.position = position
        self.color = color
        self.timestamp = None  # Will be set by the server
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "action_type": self.action_type,
            "position": self.position.to_dict(),
            "color": self.color,
            "timestamp": self.timestamp
        } 