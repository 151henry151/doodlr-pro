"""
Canvas model and business logic for managing the hierarchical canvas system.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.types import Position, CanvasSquare, CanvasState, CanvasLevel, Color
from sqlalchemy.orm import Session
from database import CanvasSquare as DBCanvasSquare, UserAction as DBUserAction
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

class CanvasManager:
    """Manages the hierarchical canvas system."""
    
    def __init__(self):
        self.max_level = 4
        self.squares_per_level = 9
    
    def get_canvas_at_level(self, db: Session, level: int, parent_x: int = 0, parent_y: int = 0) -> CanvasState:
        """Get canvas squares for a specific level and parent position."""
        # Query database for squares at this level
        squares = db.query(DBCanvasSquare).filter(
            DBCanvasSquare.level == level,
            DBCanvasSquare.x >= parent_x * 3,
            DBCanvasSquare.x < (parent_x + 1) * 3,
            DBCanvasSquare.y >= parent_y * 3,
            DBCanvasSquare.y < (parent_y + 1) * 3
        ).all()
        
        # Convert to CanvasSquare objects
        canvas_squares = []
        for square in squares:
            position = Position(square.x, square.y, CanvasLevel(square.level))
            canvas_square = CanvasSquare(
                position=position,
                color=square.color,
                is_zoomable=square.is_zoomable and square.level < self.max_level
            )
            canvas_squares.append(canvas_square)
        
        # If no squares exist, create default ones
        if not canvas_squares:
            canvas_squares = self._create_default_squares(level, parent_x, parent_y)
            # Save to database
            for square in canvas_squares:
                db_square = DBCanvasSquare(
                    x=square.position.x,
                    y=square.position.y,
                    level=square.position.level.value,
                    color=square.color,
                    is_zoomable=square.is_zoomable
                )
                db.add(db_square)
            db.commit()
        
        return CanvasState(canvas_squares)
    
    def _create_default_squares(self, level: int, parent_x: int = 0, parent_y: int = 0) -> List[CanvasSquare]:
        """Create default squares for a level if none exist."""
        squares = []
        start_x = parent_x * 3
        start_y = parent_y * 3
        
        for x in range(3):
            for y in range(3):
                position = Position(start_x + x, start_y + y, CanvasLevel(level))
                is_zoomable = level < self.max_level
                square = CanvasSquare(
                    position=position,
                    color=None,
                    is_zoomable=is_zoomable
                )
                squares.append(square)
        
        return squares
    
    def paint_square(self, db: Session, user_id: str, x: int, y: int, level: int, color: str) -> bool:
        """Paint a square at the specified position."""
        if level != self.max_level:
            return False  # Can only paint at the deepest level
        
        # Find or create the square
        square = db.query(DBCanvasSquare).filter(
            DBCanvasSquare.x == x,
            DBCanvasSquare.y == y,
            DBCanvasSquare.level == level
        ).first()
        
        if not square:
            square = DBCanvasSquare(
                x=x,
                y=y,
                level=level,
                color=color,
                is_zoomable=False
            )
            db.add(square)
        else:
            square.color = color
            square.updated_at = datetime.utcnow()
        
        # Log the action
        action = DBUserAction(
            user_id=user_id,
            action_type="paint",
            x=x,
            y=y,
            level=level,
            color=color
        )
        db.add(action)
        
        db.commit()
        return True
    
    def zoom_to_position(self, db: Session, user_id: str, x: int, y: int, level: int) -> Optional[CanvasState]:
        """Zoom to a specific position in the canvas."""
        if level >= self.max_level:
            return None  # Can't zoom further
        
        # Log the zoom action
        action = DBUserAction(
            user_id=user_id,
            action_type="zoom",
            x=x,
            y=y,
            level=level
        )
        db.add(action)
        db.commit()
        
        # Return the canvas at the next level
        return self.get_canvas_at_level(db, level + 1, x, y)
    
    def get_available_colors(self) -> List[Dict[str, str]]:
        """Get the available color palette."""
        return [
            {"name": color.name, "value": color.value}
            for color in Color
        ] 