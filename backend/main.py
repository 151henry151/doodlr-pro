from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import canvas
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="Doodlr API",
    description="Collaborative drawing app API",
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

# Serve static marketing site for local development under /site
WEBSITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "website"))
if os.path.isdir(WEBSITE_DIR):
    app.mount("/site", StaticFiles(directory=WEBSITE_DIR, html=True), name="site")

@app.get("/")
async def root():
    return {"message": "Welcome to Doodlr API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 