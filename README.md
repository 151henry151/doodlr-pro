# Doodlr — Collaborative Drawing App

Doodlr is a collaborative, zoomable pixel-art canvas with a 6-level hierarchical grid. It uses a FastAPI backend with SQLite for storage and an Expo (React Native + Web) frontend. You can draw pixels, zoom into sections, and view the canvas across levels while maintaining consistent pixel positions.

## Features
- 6-level hierarchical canvas (729×729 total)
- Zoom between levels 1–6 in a 3×3 grid per level
- Paint pixels with multiple colors
- Consistent pixel alignment across zoom levels
- Web (Expo web) and mobile (Expo Go) development flows

## Tech Stack
- Backend: FastAPI, Uvicorn, SQLAlchemy, SQLite
- Frontend: Expo, React Native, React Native Web
- E2E: Playwright (browser)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+ and npm

### Quick start
Use the script that handles both backend and frontend:

```bash
bash ./start.sh
```

Notes:
- The script runs Expo in the foreground so you can use keys like `w` (open web), `s` (switch build), `r` (reload).
- The backend starts on `http://localhost:8000`. API docs are available at `/docs` if enabled.

If port 8000 is in use:
```bash
lsof -ti:8000 | xargs -r kill
```

### Simple start (no health checks)
```bash
bash ./start-simple.sh
```

## Project Structure
- `backend/`: FastAPI app, models, and routes
- `frontend/`: Expo app (React Native + Web)
- `shared/`: Shared types/helpers (if any)

## API Overview
- `GET /` — Service root
- `GET /health` — Health check
- `GET /colors` — Available colors
- `GET /level/{level}` — Canvas data for the given level; for levels 2–6, pass `section_x`, `section_y`
- `POST /paint` — Paint a pixel `{ x, y, color }`
- `POST /zoom` — Validate zoom target `{ level, section_x, section_y }`

## Frontend Tips
- Keys in the Expo terminal:
  - `w` open web
  - `r` reload
  - `?` list all commands
- Webpack dev server serves at `http://localhost:19006`

## Development Notes
- Expo now runs in the foreground from `start.sh` to accept keyboard input.
- Section grid lines have slightly increased contrast for visibility.
- Pixel positions are aggregated per true section span to remain consistent across zoom levels.

## Versioning
The current version is stored in the `VERSION` file and follows Semantic Versioning.

Current: `1.0.0`

## License
This project is licensed under the GNU General Public License v3.0 or later (GPL-3.0-or-later).

See `LICENSE` for the full text. 