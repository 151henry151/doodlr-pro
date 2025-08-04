# Doodlr - Collaborative Graffiti Canvas App

## Overview

Doodlr is a cross-platform collaborative drawing app built with Expo React Native and Python FastAPI backend. Users can create artwork on a shared canvas by zooming into specific areas and painting individual pixels.

## Core Concept

The app features a hierarchical canvas system:
- The main canvas is divided into 9 squares
- Each square can be further divided into 9 squares (up to 4 levels deep)
- Users can "zoom in" by clicking on squares to navigate deeper into the canvas
- At the deepest level, users can paint individual squares with colors from a palette
- The canvas is shared among all users, creating a collaborative graffiti board

## Features

- **Hierarchical Canvas**: 4-level deep zoom system
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Color Palette**: Standard color selection for painting
- **Cross-platform**: Works on iOS and Android
- **Responsive Design**: Adapts to different screen sizes
- **WebSocket Support**: Real-time updates for collaborative features

## Architecture

### Frontend (Expo React Native)
- **Framework**: Expo with React Native
- **State Management**: React Context API for global state
- **UI Components**: Custom canvas components with touch handling
- **Platform Support**: iOS and Android

### Backend (Python FastAPI)
- **Framework**: FastAPI for REST API
- **Database**: SQLite for storing canvas data and user sessions
- **WebSocket**: Real-time updates for collaborative features
- **Authentication**: Simple session-based auth

## Project Structure

```
doodlr/
├── frontend/                 # Expo React Native app
│   ├── App.js               # Main app entry point
│   ├── components/          # Reusable UI components
│   │   ├── Canvas.js       # Main canvas component
│   │   ├── ColorPalette.js # Color selection component
│   │   └── NavigationControls.js # Navigation controls
│   ├── screens/            # Screen components
│   │   └── CanvasScreen.js # Main canvas screen
│   ├── context/            # React Context providers
│   │   └── CanvasContext.js # Canvas state management
│   ├── services/           # API communication
│   │   └── api.js         # API service
│   └── utils/              # Helper functions
├── backend/                 # Python FastAPI server
│   ├── main.py             # FastAPI app entry point
│   ├── models/             # Database models
│   │   └── canvas.py       # Canvas business logic
│   ├── routes/             # API endpoints
│   │   └── canvas.py       # Canvas API routes
│   ├── services/           # Business logic
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── package.json        # Backend scripts
├── shared/                  # Shared types and utilities
│   └── types.py            # TypeScript/Python shared types
├── start.sh                # Startup script
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Expo CLI (`npm install -g @expo/cli`)
- Git

### Option 1: Using the startup script (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd doodlr

# Run the startup script
./start.sh
```

### Option 2: Manual setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend will be available at `http://localhost:8000`

#### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

- `GET /canvas/` - Get root canvas (level 1)
- `GET /canvas/level/{level}` - Get canvas at specific level
- `POST /canvas/paint` - Paint a square
- `POST /canvas/zoom` - Zoom to a position
- `GET /canvas/colors` - Get available colors
- `WS /canvas/ws` - WebSocket for real-time updates

## Usage

1. **Start the app**: Run `./start.sh` or start backend and frontend separately
2. **Navigate the canvas**: Tap squares to zoom in (up to 4 levels deep)
3. **Paint squares**: At level 4, select a color and tap squares to paint them
4. **Collaborate**: Multiple users can edit the same canvas simultaneously
5. **Navigate back**: Use the navigation controls to go back or return to root

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npx expo start
```

### Database
The app uses SQLite for simplicity. The database file (`doodlr.db`) will be created automatically when the backend starts.

## Testing

### Backend Testing
```bash
cd backend
python -m pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
The backend can be deployed to any Python hosting service (Heroku, Railway, etc.) by:
1. Installing dependencies from `requirements.txt`
2. Running `python main.py` or `uvicorn main:app`

### Frontend Deployment
The frontend can be built and deployed using Expo:
```bash
cd frontend
npx expo build:android  # For Android
npx expo build:ios      # For iOS
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Backend won't start**: Make sure Python 3.8+ is installed and all dependencies are installed
2. **Frontend won't start**: Make sure Node.js is installed and run `npm install`
3. **API connection errors**: Make sure the backend is running on `http://localhost:8000`
4. **WebSocket errors**: Check that the backend supports WebSocket connections

### Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Ensure all dependencies are installed
3. Verify the backend is running and accessible
4. Check the API documentation at `http://localhost:8000/docs` 