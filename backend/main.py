from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from routes import canvas
from fastapi.staticfiles import StaticFiles
import os
import base64

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

# Simple dev-only Basic Auth for static admin dashboard
ADMIN_USER = "admin"
ADMIN_PASS = "evergreen"

@app.middleware("http")
async def basic_auth_for_site_admin(request: Request, call_next):
    path = request.url.path
    if path.startswith("/site/admin"):
        auth = request.headers.get("authorization")
        expected = base64.b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()
        if not auth or not auth.lower().startswith("basic ") or auth.split(" ", 1)[1] != expected:
            return Response(status_code=401, headers={"WWW-Authenticate": "Basic realm=admin"})
    return await call_next(request)

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