import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { canvasAPI } from '../services/api';

const CanvasContext = createContext();

const initialState = {
  currentLevel: 1,
  currentSection: { x: 0, y: 0 },
  canvasData: [],
  selectedColor: 'red',
  colors: [],
  loading: false,
  error: null,
  navigationHistory: [],
  // Track zoom path explicitly: selections at each level (local coords 0..2)
  zoomPath: {
    level1: null, // {x,y} selected at level 1
    level2: null, // {x,y} selected at level 2 (local within L1)
    level3: null, // {x,y} selected at level 3 (local within L2)
  },
  fetchParams: { level: 1, sectionX: null, sectionY: null },
};

const canvasReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };
    case 'SET_CANVAS_DATA':
      return { ...state, canvasData: action.payload };
    case 'SET_SELECTED_COLOR':
      return { ...state, selectedColor: action.payload };
    case 'SET_COLORS':
      return { ...state, colors: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_PIXEL':
      return {
        ...state,
        canvasData: state.canvasData.map(section => {
          if (section.x === action.payload.sectionX && section.y === action.payload.sectionY) {
            return {
              ...section,
              pixels: section.pixels.map(pixel =>
                pixel.x === action.payload.x && pixel.y === action.payload.y
                  ? { ...pixel, color: action.payload.color }
                  : pixel
              )
            };
          }
          return section;
        })
      };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload]
      };
    case 'REMOVE_FROM_HISTORY':
      return {
        ...state,
        navigationHistory: state.navigationHistory.slice(0, -1)
      };
    case 'SET_NAVIGATION_HISTORY':
      return {
        ...state,
        navigationHistory: action.payload
      };
    case 'SET_ZOOM_PATH':
      return { ...state, zoomPath: { ...state.zoomPath, ...action.payload } };
    case 'CLEAR_ZOOM_FROM_LEVEL': {
      const level = action.payload; // 1,2, or 3 meaning clear that level and deeper
      const cleared = { ...state.zoomPath };
      if (level <= 1) cleared.level1 = null;
      if (level <= 2) cleared.level2 = null;
      if (level <= 3) cleared.level3 = null;
      return { ...state, zoomPath: cleared };
    }
    case 'SET_LAST_FETCH':
      return { ...state, lastFetch: action.payload };
    case 'SET_FETCH_PARAMS':
      return { ...state, fetchParams: action.payload };
    default:
      return state;
  }
};

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Track the last request made to the backend for easier testing/debugging
  // We keep it outside reducer for simplicity; store in reducer via SET_LAST_FETCH

  // Load colors and initial canvas data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const response = await canvasAPI.getColors();
        dispatch({ type: 'SET_COLORS', payload: response.colors });
        const data = await canvasAPI.getRootCanvas();
        dispatch({ type: 'SET_CANVAS_DATA', payload: data.sections });
        dispatch({ type: 'SET_CURRENT_LEVEL', payload: 1 });
        dispatch({ type: 'SET_FETCH_PARAMS', payload: { level: 1, sectionX: null, sectionY: null } });
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    initializeApp();
  }, []);

  // Load canvas data
  const loadCanvasData = async (level = 1, sectionX = null, sectionY = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = level === 1 
        ? await canvasAPI.getRootCanvas()
        : await canvasAPI.getCanvasLevel(level, sectionX, sectionY);
      dispatch({ type: 'SET_CANVAS_DATA', payload: data.sections });
      dispatch({ type: 'SET_CURRENT_LEVEL', payload: level });
      dispatch({ type: 'SET_LAST_FETCH', payload: new Date() });
      dispatch({ type: 'SET_FETCH_PARAMS', payload: { level, sectionX, sectionY } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Paint a pixel
  const paintPixel = async (x, y, color) => {
    try {
      await canvasAPI.paintPixel(x, y, color);
      if (state.currentLevel === 4) {
        const fx = state.fetchParams?.sectionX ?? 0;
        const fy = state.fetchParams?.sectionY ?? 0;
        await loadCanvasData(4, fx, fy);
      } else {
        dispatch({
          type: 'UPDATE_PIXEL',
          payload: { x, y, color, sectionX: Math.floor(x / 27), sectionY: Math.floor(y / 27) },
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Helpers to compute global indices
  const computeLevel2Global = (l1, local) => ({
    x: l1.x * 3 + local.x,
    y: l1.y * 3 + local.y,
  });
  const computeLevel3Global = (l1, l2, local) => ({
    x: l1.x * 9 + l2.x * 3 + local.x,
    y: l1.y * 9 + l2.y * 3 + local.y,
  });

  // Zoom to section (sectionX, sectionY are local 0..2 at current level)
  const zoomToSection = async (sectionX, sectionY) => {
    const nextLevel = state.currentLevel + 1;
    if (nextLevel > 4) return;

    let targetSectionX = null;
    let targetSectionY = null;

    if (state.currentLevel === 1) {
      // L1 -> L2
      const l1 = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level1: l1, level2: null, level3: null } });
      targetSectionX = l1.x;
      targetSectionY = l1.y;
    } else if (state.currentLevel === 2) {
      // L2 -> L3
      const l1 = state.zoomPath.level1;
      const l2Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level2: l2Local, level3: null } });
      const g2 = computeLevel2Global(l1, l2Local);
      targetSectionX = g2.x;
      targetSectionY = g2.y;
    } else if (state.currentLevel === 3) {
      // L3 -> L4
      const l1 = state.zoomPath.level1;
      const l2 = state.zoomPath.level2;
      const l3Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level3: l3Local } });
      const g3 = computeLevel3Global(l1, l2, l3Local);
      targetSectionX = g3.x;
      targetSectionY = g3.y;
    }

    // Save history and advance
    dispatch({ 
      type: 'ADD_TO_HISTORY', 
      payload: { level: state.currentLevel, section: state.currentSection }
    });

    // For UI purposes, keep the last clicked local section
    dispatch({ type: 'SET_CURRENT_SECTION', payload: { x: sectionX, y: sectionY } });
    await loadCanvasData(nextLevel, targetSectionX, targetSectionY);
  };

  // Navigate back one level
  const navigateBack = async () => {
    if (state.currentLevel === 1) return;

    const previousState = state.navigationHistory[state.navigationHistory.length - 1];
    dispatch({ type: 'REMOVE_FROM_HISTORY' });

    // Adjust zoom path when stepping back
    if (state.currentLevel === 4) {
      // Back to L3 => clear level3 selection
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 3 });
    } else if (state.currentLevel === 3) {
      // Back to L2 => clear level2 and level3
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 2 });
    } else if (state.currentLevel === 2) {
      // Back to L1 => clear all
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 1 });
    }

    dispatch({ type: 'SET_CURRENT_LEVEL', payload: previousState.level });
    dispatch({ type: 'SET_CURRENT_SECTION', payload: previousState.section });

    if (previousState.level === 1) {
      await loadCanvasData(1);
    } else if (previousState.level === 2) {
      const l1 = state.zoomPath.level1; // after CLEAR, this may be null; recompute from history
      const level1 = l1 ?? previousState.section; // fallback
      await loadCanvasData(2, level1.x, level1.y);
    } else if (previousState.level === 3) {
      // Recompute global L2 using stored path
      const l1 = state.zoomPath.level1 ?? previousState.section;
      const l2 = state.zoomPath.level2;
      const g2 = l2 ? computeLevel2Global(l1, l2) : { x: 0, y: 0 };
      await loadCanvasData(3, g2.x, g2.y);
    }
  };

  // Go to root (Level 1)
  const goToRoot = async () => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: { x: 0, y: 0 } });
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: 1 });
    dispatch({ type: 'SET_NAVIGATION_HISTORY', payload: [] });
    dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 1 });
    await loadCanvasData(1);
  };

  // Select drawing color
  const selectColor = (color) => {
    dispatch({ type: 'SET_SELECTED_COLOR', payload: color });
  };
 
  const value = {
    ...state,
    fetchParams: state.fetchParams,
    paintPixel,
    zoomToSection,
    navigateBack,
    goToRoot,
    loadCanvasData,
    selectColor,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}; 