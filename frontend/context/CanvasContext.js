/**
 * Canvas Context for managing canvas state and navigation.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

const CanvasContext = createContext();

// Action types
const ACTIONS = {
  SET_CANVAS: 'SET_CANVAS',
  SET_LEVEL: 'SET_LEVEL',
  SET_PARENT_POSITION: 'SET_PARENT_POSITION',
  SET_SELECTED_COLOR: 'SET_SELECTED_COLOR',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_SQUARE: 'UPDATE_SQUARE',
  SET_COLORS: 'SET_COLORS',
};

// Initial state
const initialState = {
  canvas: null,
  level: 1,
  parentX: 0,
  parentY: 0,
  selectedColor: '#FF0000',
  loading: false,
  error: null,
  colors: [],
  navigationHistory: [],
};

// Reducer function
function canvasReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CANVAS:
      return {
        ...state,
        canvas: action.payload,
        loading: false,
        error: null,
      };
    
    case ACTIONS.SET_LEVEL:
      return {
        ...state,
        level: action.payload,
      };
    
    case ACTIONS.SET_PARENT_POSITION:
      return {
        ...state,
        parentX: action.payload.x,
        parentY: action.payload.y,
      };
    
    case ACTIONS.SET_SELECTED_COLOR:
      return {
        ...state,
        selectedColor: action.payload,
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case ACTIONS.UPDATE_SQUARE:
      if (!state.canvas) return state;
      
      const updatedSquares = state.canvas.squares.map(square => {
        if (square.position.x === action.payload.x && 
            square.position.y === action.payload.y &&
            square.position.level === action.payload.level) {
          return {
            ...square,
            color: action.payload.color,
          };
        }
        return square;
      });
      
      return {
        ...state,
        canvas: {
          ...state.canvas,
          squares: updatedSquares,
        },
      };
    
    case ACTIONS.SET_COLORS:
      return {
        ...state,
        colors: action.payload,
      };
    
    default:
      return state;
  }
}

// Canvas Provider component
export function CanvasProvider({ children }) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Load colors on mount
  useEffect(() => {
    loadColors();
  }, []);

  // Load initial canvas
  useEffect(() => {
    loadCanvas();
  }, [state.level, state.parentX, state.parentY]);

  const loadColors = async () => {
    try {
      const response = await apiService.getColors();
      dispatch({ type: ACTIONS.SET_COLORS, payload: response.colors });
    } catch (error) {
      console.error('Failed to load colors:', error);
    }
  };

  const loadCanvas = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      let response;
      if (state.level === 1) {
        response = await apiService.getCanvasRoot();
      } else {
        response = await apiService.getCanvasAtLevel(state.level, state.parentX, state.parentY);
      }
      
      dispatch({ type: ACTIONS.SET_CANVAS, payload: response.canvas });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const zoomToSquare = async (x, y) => {
    if (state.level >= 4) return; // Can't zoom further
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await apiService.zoomToPosition(x, y, state.level);
      
      // Add current position to navigation history
      const newHistory = [
        ...state.navigationHistory,
        { level: state.level, parentX: state.parentX, parentY: state.parentY }
      ];
      
      dispatch({ type: ACTIONS.SET_LEVEL, payload: response.level });
      dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: response.parent_x, y: response.parent_y } });
      dispatch({ type: ACTIONS.SET_CANVAS, payload: response.canvas });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const paintSquare = async (x, y) => {
    if (state.level !== 4) return; // Can only paint at level 4
    
    try {
      await apiService.paintSquare(x, y, state.level, state.selectedColor);
      
      // Update local state immediately for better UX
      dispatch({
        type: ACTIONS.UPDATE_SQUARE,
        payload: { x, y, level: state.level, color: state.selectedColor }
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const setSelectedColor = (color) => {
    dispatch({ type: ACTIONS.SET_SELECTED_COLOR, payload: color });
  };

  const goBack = () => {
    if (state.navigationHistory.length === 0) return;
    
    const previous = state.navigationHistory[state.navigationHistory.length - 1];
    const newHistory = state.navigationHistory.slice(0, -1);
    
    dispatch({ type: ACTIONS.SET_LEVEL, payload: previous.level });
    dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: previous.parentX, y: previous.parentY } });
  };

  const goToRoot = () => {
    dispatch({ type: ACTIONS.SET_LEVEL, payload: 1 });
    dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: 0, y: 0 } });
  };

  const value = {
    ...state,
    zoomToSquare,
    paintSquare,
    setSelectedColor,
    goBack,
    goToRoot,
    loadCanvas,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

// Hook to use canvas context
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
} 