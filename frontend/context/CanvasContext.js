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
  // Track zoom path explicitly across 5 navigation levels (L1..L5)
  zoomPath: {
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    level5: null,
  },
  fetchParams: { level: 1, sectionX: null, sectionY: null },
  // Drawing mode toggle for levels 4-6
  drawingMode: false,
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
      const level = action.payload; // 1..5 meaning clear that level and deeper
      const cleared = { ...state.zoomPath };
      if (level <= 1) cleared.level1 = null;
      if (level <= 2) cleared.level2 = null;
      if (level <= 3) cleared.level3 = null;
      if (level <= 4) cleared.level4 = null;
      if (level <= 5) cleared.level5 = null;
      return { ...state, zoomPath: cleared };
    }
    case 'SET_LAST_FETCH':
      return { ...state, lastFetch: action.payload };
    case 'SET_FETCH_PARAMS':
      return { ...state, fetchParams: action.payload };
    case 'TOGGLE_DRAWING_MODE':
      return { ...state, drawingMode: !state.drawingMode };
    case 'SET_DRAWING_MODE':
      return { ...state, drawingMode: action.payload };
    default:
      return state;
  }
};

export const CanvasProvider = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

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

  // Paint a pixel (optimized for drag painting)
  const paintPixel = async (x, y, color, shouldRefresh = true) => {
    try {
      console.log(`Painting pixel at (${x}, ${y}) with color ${color}`);
      await canvasAPI.paintPixel(x, y, color);
      console.log('Pixel painted successfully');
      
      if (shouldRefresh) {
        console.log('Refreshing canvas data...');
        // Refresh canvas data for all levels to ensure UI updates
        // Use the current fetchParams to maintain the correct section context
        const { level, sectionX, sectionY } = state.fetchParams;
        console.log(`Refreshing with level=${level}, sectionX=${sectionX}, sectionY=${sectionY}`);
        await loadCanvasData(level, sectionX, sectionY);
        console.log('Canvas data refreshed');
      }
    } catch (error) {
      console.error('Error painting pixel:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Batch refresh for drag painting (call this after drag ends)
  const refreshCanvasAfterDrag = async () => {
    try {
      console.log('Batch refreshing canvas after drag...');
      const { level, sectionX, sectionY } = state.fetchParams;
      await loadCanvasData(level, sectionX, sectionY);
      console.log('Batch refresh completed');
    } catch (error) {
      console.error('Error refreshing canvas after drag:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Helpers to compute global indices through the hierarchy
  const computeLevel2Global = (l1, local) => ({ x: l1.x * 3 + local.x, y: l1.y * 3 + local.y });
  const computeLevel3Global = (l1, l2, local) => ({ x: l1.x * 9 + l2.x * 3 + local.x, y: l1.y * 9 + l2.y * 3 + local.y });
  const computeLevel4Global = (l1, l2, l3, local) => ({ x: l1.x * 27 + l2.x * 9 + l3.x * 3 + local.x, y: l1.y * 27 + l2.y * 9 + l3.y * 3 + local.y });
  const computeLevel5Global = (l1, l2, l3, l4, local) => ({ x: l1.x * 81 + l2.x * 27 + l3.x * 9 + l4.x * 3 + local.x, y: l1.y * 81 + l2.y * 27 + l3.y * 9 + l4.y * 3 + local.y });

  // Zoom to section (sectionX, sectionY are local 0..2 at current level)
  const zoomToSection = async (sectionX, sectionY) => {
    const nextLevel = state.currentLevel + 1;
    if (nextLevel > 6) return;

    let targetSectionX = null;
    let targetSectionY = null;

    if (state.currentLevel === 1) {
      const l1 = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level1: l1, level2: null, level3: null, level4: null, level5: null } });
      targetSectionX = l1.x;
      targetSectionY = l1.y;
    } else if (state.currentLevel === 2) {
      const l1 = state.zoomPath.level1;
      const l2Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level2: l2Local, level3: null, level4: null, level5: null } });
      const g2 = computeLevel2Global(l1, l2Local);
      targetSectionX = g2.x;
      targetSectionY = g2.y;
    } else if (state.currentLevel === 3) {
      const l1 = state.zoomPath.level1;
      const l2 = state.zoomPath.level2;
      const l3Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level3: l3Local, level4: null, level5: null } });
      const g3 = computeLevel3Global(l1, l2, l3Local);
      targetSectionX = g3.x;
      targetSectionY = g3.y;
    } else if (state.currentLevel === 4) {
      const l1 = state.zoomPath.level1;
      const l2 = state.zoomPath.level2;
      const l3 = state.zoomPath.level3;
      const l4Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level4: l4Local, level5: null } });
      const g4 = computeLevel4Global(l1, l2, l3, l4Local);
      targetSectionX = g4.x;
      targetSectionY = g4.y;
    } else if (state.currentLevel === 5) {
      const l1 = state.zoomPath.level1;
      const l2 = state.zoomPath.level2;
      const l3 = state.zoomPath.level3;
      const l4 = state.zoomPath.level4;
      const l5Local = { x: sectionX, y: sectionY };
      dispatch({ type: 'SET_ZOOM_PATH', payload: { level5: l5Local } });
      const g5 = computeLevel5Global(l1, l2, l3, l4, l5Local);
      targetSectionX = g5.x;
      targetSectionY = g5.y;
    }

    dispatch({ 
      type: 'ADD_TO_HISTORY', 
      payload: { level: state.currentLevel, section: state.currentSection }
    });

    dispatch({ type: 'SET_CURRENT_SECTION', payload: { x: sectionX, y: sectionY } });
    await loadCanvasData(nextLevel, targetSectionX, targetSectionY);
  };

  // Navigate back one level
  const navigateBack = async () => {
    if (state.currentLevel === 1) return;

    const previousState = state.navigationHistory[state.navigationHistory.length - 1];
    dispatch({ type: 'REMOVE_FROM_HISTORY' });

    if (state.currentLevel === 6) {
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 5 });
    } else if (state.currentLevel === 5) {
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 4 });
    } else if (state.currentLevel === 4) {
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 3 });
    } else if (state.currentLevel === 3) {
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 2 });
    } else if (state.currentLevel === 2) {
      dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 1 });
    }

    dispatch({ type: 'SET_CURRENT_LEVEL', payload: previousState.level });
    dispatch({ type: 'SET_CURRENT_SECTION', payload: previousState.section });

    if (previousState.level === 1) {
      await loadCanvasData(1);
    } else if (previousState.level === 2) {
      const l1 = state.zoomPath.level1 ?? previousState.section;
      await loadCanvasData(2, l1.x, l1.y);
    } else if (previousState.level === 3) {
      const l1 = state.zoomPath.level1 ?? previousState.section;
      const l2 = state.zoomPath.level2;
      const g2 = computeLevel2Global(l1, l2 ?? { x: 0, y: 0 });
      await loadCanvasData(3, g2.x, g2.y);
    } else if (previousState.level === 4) {
      const l1 = state.zoomPath.level1 ?? previousState.section;
      const l2 = state.zoomPath.level2 ?? { x: 0, y: 0 };
      const l3 = state.zoomPath.level3 ?? { x: 0, y: 0 };
      const g3 = computeLevel3Global(l1, l2, l3);
      await loadCanvasData(4, g3.x, g3.y);
    } else if (previousState.level === 5) {
      const l1 = state.zoomPath.level1 ?? previousState.section;
      const l2 = state.zoomPath.level2 ?? { x: 0, y: 0 };
      const l3 = state.zoomPath.level3 ?? { x: 0, y: 0 };
      const l4 = state.zoomPath.level4 ?? { x: 0, y: 0 };
      const g4 = computeLevel4Global(l1, l2, l3, l4);
      await loadCanvasData(5, g4.x, g4.y);
    }
  };

  const goToRoot = async () => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: { x: 0, y: 0 } });
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: 1 });
    dispatch({ type: 'SET_NAVIGATION_HISTORY', payload: [] });
    dispatch({ type: 'CLEAR_ZOOM_FROM_LEVEL', payload: 1 });
    await loadCanvasData(1);
  };

  const selectColor = (color) => {
    dispatch({ type: 'SET_SELECTED_COLOR', payload: color });
  };

  const toggleDrawingMode = async () => {
    dispatch({ type: 'TOGGLE_DRAWING_MODE' });
    // Refresh canvas data when switching to drawing mode to ensure we have the latest pixels
    if (!state.drawingMode) { // We're switching TO drawing mode
      await loadCanvasData(state.currentLevel, state.fetchParams.sectionX, state.fetchParams.sectionY);
    }
  };

  const setDrawingMode = (mode) => {
    dispatch({ type: 'SET_DRAWING_MODE', payload: mode });
  };

  const isDrawableLevel = () => state.currentLevel >= 4 && state.currentLevel <= 5;
 
  const value = {
    ...state,
    fetchParams: state.fetchParams,
    paintPixel,
    refreshCanvasAfterDrag,
    zoomToSection,
    navigateBack,
    goToRoot,
    loadCanvasData,
    selectColor,
    toggleDrawingMode,
    setDrawingMode,
    isDrawableLevel,
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