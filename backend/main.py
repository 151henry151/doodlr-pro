"""
Main FastAPI application for the Doodlr backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routes import canvas

# Create FastAPI app
app = FastAPI(
    title="Doodlr API",
    description="Backend API for the Doodlr collaborative canvas app",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(canvas.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    create_tables()
    print("Database tables created successfully!")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Doodlr API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 