"""
Canvas API routes for the Doodlr backend.
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import uuid
from datetime import datetime

from database import get_db
from models.canvas import CanvasManager

router = APIRouter(prefix="/canvas", tags=["canvas"])

# Global canvas manager
canvas_manager = CanvasManager()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected clients
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.get("/")
async def get_canvas_root(db: Session = Depends(get_db)):
    """Get the root canvas (level 1)."""
    try:
        canvas_state = canvas_manager.get_canvas_at_level(db, 1)
        print(f"DEBUG: Root canvas has {len(canvas_state.squares)} squares")
        for square in canvas_state.squares:
            print(f"DEBUG: Square ({square.position.x},{square.position.y}) has color {square.color}")
        return {
            "success": True,
            "canvas": canvas_state.to_dict(),
            "level": 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/level/{level}")
async def get_canvas_at_level(
    level: int, 
    parent_x: int = 0, 
    parent_y: int = 0,
    db: Session = Depends(get_db)
):
    """Get canvas at a specific level and parent position."""
    if level < 1 or level > 4:
        raise HTTPException(status_code=400, detail="Invalid level")
    
    try:
        canvas_state = canvas_manager.get_canvas_at_level(db, level, parent_x, parent_y)
        return {
            "success": True,
            "canvas": canvas_state.to_dict(),
            "level": level,
            "parent_x": parent_x,
            "parent_y": parent_y
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/paint")
async def paint_square(
    x: int,
    y: int,
    level: int,
    color: str,
    user_id: str = None,
    db: Session = Depends(get_db)
):
    """Paint a square at the specified position."""
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:8]}"
    
    if level != 4:
        raise HTTPException(status_code=400, detail="Can only paint at level 4")
    
    try:
        success = canvas_manager.paint_square(db, user_id, x, y, level, color)
        if success:
            # Broadcast the paint action to all connected clients
            await manager.broadcast(json.dumps({
                "type": "paint",
                "x": x,
                "y": y,
                "level": level,
                "color": color,
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
            
            return {
                "success": True,
                "message": "Square painted successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to paint square")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/zoom")
async def zoom_to_position(
    x: int,
    y: int,
    level: int,
    user_id: str = None,
    db: Session = Depends(get_db)
):
    """Zoom to a specific position in the canvas."""
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:8]}"
    
    if level >= 4:
        raise HTTPException(status_code=400, detail="Cannot zoom further")
    
    try:
        canvas_state = canvas_manager.zoom_to_position(db, user_id, x, y, level)
        if canvas_state:
            return {
                "success": True,
                "canvas": canvas_state.to_dict(),
                "level": level + 1,
                "parent_x": x,
                "parent_y": y
            }
        else:
            raise HTTPException(status_code=400, detail="Cannot zoom to this position")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/colors")
async def get_colors():
    """Get available colors for painting."""
    try:
        colors = canvas_manager.get_available_colors()
        return {
            "success": True,
            "colors": colors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
            # For now, just echo back
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket) 