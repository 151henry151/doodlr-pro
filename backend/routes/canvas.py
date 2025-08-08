from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from database import get_db, Canvas
from models.canvas import CanvasModel, PixelData, CanvasSection, PaintRequest, ZoomRequest

router = APIRouter()

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
                pass

manager = ConnectionManager()

@router.get("/")
async def get_root_canvas(db: Session = Depends(get_db)):
    """Get the root canvas (Level 1) - shows all 531,441 pixels via 9 sections"""
    # Level 1: Show 9 sections (3x3 grid), each containing 59,049 pixels (243x243)
    sections = CanvasModel.get_sections_for_level(1)
    canvas_data = []
    
    for section_x, section_y in sections:
        # Get pixels for this section
        start_x, start_y, end_x, end_y = CanvasModel.get_section_bounds(1, section_x, section_y)
        
        # Query database for pixels in this section
        pixels = db.query(Canvas).filter(
            Canvas.x >= start_x,
            Canvas.x <= end_x,
            Canvas.y >= start_y,
            Canvas.y <= end_y
        ).all()
        
        pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
        
        canvas_data.append(CanvasSection(
            x=section_x,
            y=section_y,
            pixels=pixel_data,
            level=1
        ))
    
    return {"sections": canvas_data, "level": 1}

@router.get("/level/{level}")
async def get_canvas_level(level: int, section_x: int = None, section_y: int = None, db: Session = Depends(get_db)):
    """Get canvas data for a specific level"""
    if level < 1 or level > 6:
        raise HTTPException(status_code=400, detail="Level must be between 1 and 6")
    
    if level == 1:
        # Level 1: Show 9 sections (3x3 grid), each containing 59,049 pixels (243x243)
        sections = CanvasModel.get_sections_for_level(level)
        canvas_data = []
        
        for section_x, section_y in sections:
            # Get pixels for this section
            start_x, start_y, end_x, end_y = CanvasModel.get_section_bounds(level, section_x, section_y)
            
            # Query database for pixels in this section
            pixels = db.query(Canvas).filter(
                Canvas.x >= start_x,
                Canvas.x <= end_x,
                Canvas.y >= start_y,
                Canvas.y <= end_y
            ).all()
            
            pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
            
            canvas_data.append(CanvasSection(
                x=section_x,
                y=section_y,
                pixels=pixel_data,
                level=level
            ))
    elif level == 2:
        # Level 2: Show 9 sections (3x3 grid), each containing 6,561 pixels (81x81)
        if section_x is None or section_y is None:
            raise HTTPException(status_code=400, detail="section_x and section_y required for level 2")
        
        # Calculate the 9 sections that belong to this Level 1 section
        # Each Level 2 section is 81x81 pixels
        start_x = section_x * CanvasModel.LEVEL1_SECTION_SIZE
        start_y = section_y * CanvasModel.LEVEL1_SECTION_SIZE
        
        canvas_data = []
        
        # Create 9 sections (3x3 grid) for the 9 Level 2 subsections in this Level 1 section
        for y in range(3):
            for x in range(3):
                subsection_x = start_x + x * CanvasModel.LEVEL2_SECTION_SIZE
                subsection_y = start_y + y * CanvasModel.LEVEL2_SECTION_SIZE
                
                # Get pixels for this subsection
                subsection_start_x = subsection_x
                subsection_start_y = subsection_y
                subsection_end_x = subsection_x + CanvasModel.LEVEL2_SECTION_SIZE - 1
                subsection_end_y = subsection_y + CanvasModel.LEVEL2_SECTION_SIZE - 1
                
                pixels = db.query(Canvas).filter(
                    Canvas.x >= subsection_start_x,
                    Canvas.x <= subsection_end_x,
                    Canvas.y >= subsection_start_y,
                    Canvas.y <= subsection_end_y
                ).all()
                
                pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
                
                canvas_data.append(CanvasSection(
                    x=x,
                    y=y,
                    pixels=pixel_data,
                    level=level
                ))
    elif level == 3:
        # Level 3: Show 9 sections (3x3 grid), each containing 729 pixels (27x27)
        if section_x is None or section_y is None:
            raise HTTPException(status_code=400, detail="section_x and section_y required for level 3")
        
        # Calculate the 9 sections that belong to this Level 2 section
        # Each Level 3 section is 27x27 pixels
        start_x = section_x * CanvasModel.LEVEL2_SECTION_SIZE
        start_y = section_y * CanvasModel.LEVEL2_SECTION_SIZE
        
        canvas_data = []
        
        for y in range(3):
            for x in range(3):
                subsection_x = start_x + x * CanvasModel.LEVEL3_SECTION_SIZE
                subsection_y = start_y + y * CanvasModel.LEVEL3_SECTION_SIZE
                
                subsection_start_x = subsection_x
                subsection_start_y = subsection_y
                subsection_end_x = subsection_x + CanvasModel.LEVEL3_SECTION_SIZE - 1
                subsection_end_y = subsection_y + CanvasModel.LEVEL3_SECTION_SIZE - 1
                
                pixels = db.query(Canvas).filter(
                    Canvas.x >= subsection_start_x,
                    Canvas.x <= subsection_end_x,
                    Canvas.y >= subsection_start_y,
                    Canvas.y <= subsection_end_y
                ).all()
                
                pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
                
                canvas_data.append(CanvasSection(
                    x=x,
                    y=y,
                    pixels=pixel_data,
                    level=level
                ))
    elif level == 4:
        # Level 4: Show 9 sections (3x3 grid), each containing 81 pixels (9x9)
        if section_x is None or section_y is None:
            raise HTTPException(status_code=400, detail="section_x and section_y required for level 4")
        
        # Each Level 4 section is 9x9 pixels
        start_x = section_x * CanvasModel.LEVEL3_SECTION_SIZE
        start_y = section_y * CanvasModel.LEVEL3_SECTION_SIZE
        
        canvas_data = []
        
        for y in range(3):
            for x in range(3):
                subsection_x = start_x + x * CanvasModel.LEVEL4_SECTION_SIZE
                subsection_y = start_y + y * CanvasModel.LEVEL4_SECTION_SIZE
                
                subsection_start_x = subsection_x
                subsection_start_y = subsection_y
                subsection_end_x = subsection_x + CanvasModel.LEVEL4_SECTION_SIZE - 1
                subsection_end_y = subsection_y + CanvasModel.LEVEL4_SECTION_SIZE - 1
                
                pixels = db.query(Canvas).filter(
                    Canvas.x >= subsection_start_x,
                    Canvas.x <= subsection_end_x,
                    Canvas.y >= subsection_start_y,
                    Canvas.y <= subsection_end_y
                ).all()
                
                pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
                
                canvas_data.append(CanvasSection(
                    x=x,
                    y=y,
                    pixels=pixel_data,
                    level=level
                ))
    elif level == 5:
        # Level 5: Show 9 sections (3x3 grid), each containing 9 pixels (3x3)
        if section_x is None or section_y is None:
            raise HTTPException(status_code=400, detail="section_x and section_y required for level 5")
        
        start_x = section_x * CanvasModel.LEVEL4_SECTION_SIZE
        start_y = section_y * CanvasModel.LEVEL4_SECTION_SIZE
        
        canvas_data = []
        
        for y in range(3):
            for x in range(3):
                subsection_x = start_x + x * CanvasModel.LEVEL5_SECTION_SIZE
                subsection_y = start_y + y * CanvasModel.LEVEL5_SECTION_SIZE
                
                subsection_start_x = subsection_x
                subsection_start_y = subsection_y
                subsection_end_x = subsection_x + CanvasModel.LEVEL5_SECTION_SIZE - 1
                subsection_end_y = subsection_y + CanvasModel.LEVEL5_SECTION_SIZE - 1
                
                pixels = db.query(Canvas).filter(
                    Canvas.x >= subsection_start_x,
                    Canvas.x <= subsection_end_x,
                    Canvas.y >= subsection_start_y,
                    Canvas.y <= subsection_end_y
                ).all()
                
                pixel_data = [PixelData(x=p.x, y=p.y, color=p.color) for p in pixels]
                
                canvas_data.append(CanvasSection(
                    x=x,
                    y=y,
                    pixels=pixel_data,
                    level=level
                ))
    else:
        # Level 6: Show 9 individual pixels (3x3 grid, 1x1 each)
        if section_x is None or section_y is None:
            raise HTTPException(status_code=400, detail="section_x and section_y required for level 6")
        
        start_x = section_x * CanvasModel.LEVEL5_SECTION_SIZE
        start_y = section_y * CanvasModel.LEVEL5_SECTION_SIZE
        
        canvas_data = []
        
        for y in range(3):
            for x in range(3):
                pixel_x = start_x + x
                pixel_y = start_y + y
                
                pixel = db.query(Canvas).filter(Canvas.x == pixel_x, Canvas.y == pixel_y).first()
                
                pixel_data: List[PixelData] = []
                if pixel:
                    pixel_data = [PixelData(x=pixel.x, y=pixel.y, color=pixel.color)]
                
                canvas_data.append(CanvasSection(
                    x=x,
                    y=y,
                    pixels=pixel_data,
                    level=level
                ))
    
    return {"sections": canvas_data, "level": level}

@router.post("/paint")
async def paint_pixel(request: PaintRequest, db: Session = Depends(get_db)):
    """Paint a pixel with a specific color"""
    if not CanvasModel.is_valid_pixel(request.x, request.y):
        raise HTTPException(status_code=400, detail="Invalid pixel coordinates")
    
    if not CanvasModel.is_valid_color(request.color):
        raise HTTPException(status_code=400, detail="Invalid color")
    
    # Check if pixel already exists
    existing_pixel = db.query(Canvas).filter(Canvas.x == request.x, Canvas.y == request.y).first()
    
    if existing_pixel:
        # Update existing pixel
        existing_pixel.color = request.color
        existing_pixel.updated_at = datetime.utcnow()
    else:
        # Create new pixel
        new_pixel = Canvas(x=request.x, y=request.y, color=request.color)
        db.add(new_pixel)
    
    db.commit()
    
    # Broadcast update to all connected clients
    update_message = {
        "type": "pixel_updated",
        "x": request.x,
        "y": request.y,
        "color": request.color
    }
    
    await manager.broadcast(str(update_message))
    
    return {"message": "Pixel painted successfully"}

@router.post("/zoom")
async def zoom_to_position(request: ZoomRequest):
    """Zoom to a specific position"""
    if request.level < 1 or request.level > 6:
        raise HTTPException(status_code=400, detail="Level must be between 1 and 6")
    
    # Validate section coordinates based on level
    # Level grid sizes are always 3 in our UI hierarchy
    max_sections = 3
    
    if request.section_x < 0 or request.section_x >= max_sections or request.section_y < 0 or request.section_y >= max_sections:
        raise HTTPException(status_code=400, detail="Invalid section coordinates")
    
    return {"message": "Zoom successful", "level": request.level, "section_x": request.section_x, "section_y": request.section_y}

@router.get("/colors")
async def get_colors():
    """Get available colors"""
    return {"colors": CanvasModel.COLORS}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message text was: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket) 