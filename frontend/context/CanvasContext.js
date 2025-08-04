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
  SET_NAVIGATION_HISTORY: 'SET_NAVIGATION_HISTORY',
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
    
    case ACTIONS.SET_NAVIGATION_HISTORY:
      return {
        ...state,
        navigationHistory: action.payload,
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

  const loadCanvas = async (level = null, parentX = null, parentY = null) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const currentLevel = level !== null ? level : state.level;
      const currentParentX = parentX !== null ? parentX : state.parentX;
      const currentParentY = parentY !== null ? parentY : state.parentY;
      
      let response;
      if (currentLevel === 1) {
        response = await apiService.getCanvasRoot();
      } else {
        response = await apiService.getCanvasAtLevel(currentLevel, currentParentX, currentParentY);
      }
      
      console.log('API Response:', response);
      console.log('Canvas squares count:', response.canvas.squares.length);
      
      dispatch({ type: ACTIONS.SET_CANVAS, payload: response.canvas });
    } catch (error) {
      console.error('Canvas loading error:', error);
      const errorMessage = error.message || error.toString() || 'Failed to load canvas';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
    }
  };

  const zoomToSquare = async (x, y) => {
    if (state.level >= 4) return; // Can't zoom further
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await apiService.zoomToPosition(x, y, state.level);
      
      console.log('Zoom response:', response);
      
      // Add current position to navigation history
      const newHistory = [
        ...state.navigationHistory,
        { level: state.level, parentX: state.parentX, parentY: state.parentY }
      ];
      
      // Update state with new level, position, canvas, and history
      dispatch({ type: ACTIONS.SET_LEVEL, payload: response.level });
      dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: response.parent_x, y: response.parent_y } });
      dispatch({ type: ACTIONS.SET_CANVAS, payload: response.canvas });
      dispatch({ type: ACTIONS.SET_NAVIGATION_HISTORY, payload: newHistory });
    } catch (error) {
      console.error('Zoom error:', error);
      const errorMessage = error.message || error.toString() || 'Unknown error occurred';
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
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
      
      // Reload the canvas to show the updated colors
      setTimeout(() => {
        loadCanvas(state.level, state.parentX, state.parentY);
      }, 100);
    } catch (error) {
      console.error('Paint error:', error);
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
    
    console.log('Going back to:', previous);
    
    dispatch({ type: ACTIONS.SET_LEVEL, payload: previous.level });
    dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: previous.parentX, y: previous.parentY } });
    dispatch({ type: ACTIONS.SET_NAVIGATION_HISTORY, payload: newHistory });
    
    // Reload canvas for the previous level with correct parameters
    setTimeout(() => {
      loadCanvas(previous.level, previous.parentX, previous.parentY);
    }, 100);
  };

  const goToRoot = () => {
    console.log('Going to root');
    dispatch({ type: ACTIONS.SET_LEVEL, payload: 1 });
    dispatch({ type: ACTIONS.SET_PARENT_POSITION, payload: { x: 0, y: 0 } });
    dispatch({ type: ACTIONS.SET_NAVIGATION_HISTORY, payload: [] });
    
    // Reload canvas for root level
    setTimeout(() => {
      loadCanvas(1, 0, 0);
    }, 100);
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