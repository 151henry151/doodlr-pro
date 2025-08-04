# Doodlr - Collaborative Graffiti Canvas App

## Overview

Doodlr is a cross-platform collaborative drawing app built with Expo React Native and Python backend. Users can create artwork on a shared canvas by zooming into specific areas and painting individual pixels.

## Core Concept

The app features a hierarchical canvas system:
- The main canvas is divided into 9 squares
- Each square can be further divided into 9 squares (up to 4 levels deep)
- Users can "zoom in" by clicking on squares to navigate deeper into the canvas
- At the deepest level, users can paint individual squares with colors from a palette
- The canvas is shared among all users, creating a collaborative graffiti board

## Architecture

### Frontend (Expo React Native)
- **Framework**: Expo with React Native
- **Navigation**: React Navigation for screen management
- **State Management**: React Context API for global state
- **UI Components**: Custom canvas components with touch handling
- **Platform Support**: iOS and Android

### Backend (Python)
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
│   ├── screens/            # Screen components
│   ├── context/            # React Context providers
│   ├── services/           # API communication
│   └── utils/              # Helper functions
├── backend/                 # Python FastAPI server
│   ├── main.py             # FastAPI app entry point
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── database.py         # Database configuration
├── shared/                  # Shared types and utilities
│   └── types.py            # TypeScript/Python shared types
└── README.md               # This file
```

## Features

- **Hierarchical Canvas**: 4-level deep zoom system
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **Color Palette**: Standard color selection for painting
- **Cross-platform**: Works on iOS and Android
- **Responsive Design**: Adapts to different screen sizes

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Expo CLI
- Git

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Development Roadmap

1. ✅ Project structure and documentation
2. 🔄 Backend API development
3. 🔄 Frontend canvas component
4. 🔄 Real-time collaboration
5. 🔄 User authentication
6. 🔄 Testing and optimization

## Contributing

This is a collaborative project. Feel free to contribute by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests

## License

MIT License - see LICENSE file for details 