import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // Attempt to derive LAN host from Expo dev server info when running on device
  try {
    const hostUri = (Constants?.expoConfig && Constants.expoConfig.hostUri)
      || (Constants?.manifest && Constants.manifest.debuggerHost)
      || null;

    if (hostUri && Platform.OS !== 'web') {
      const host = hostUri.split(':')[0];
      if (host) {
        return `http://${host}:8000`;
      }
    }
  } catch (e) {
    // Ignore and fall through to localhost
  }

  return 'http://localhost:8000';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const canvasAPI = {
  // Get root canvas (level 1)
  getRootCanvas: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Get canvas at specific level
  getCanvasLevel: async (level, sectionX = null, sectionY = null) => {
    let url = `/level/${level}`;
    if (sectionX !== null && sectionY !== null) {
      url += `?section_x=${sectionX}&section_y=${sectionY}`;
      
    }
    const response = await api.get(url);
    return response.data;
  },

  // Paint a pixel
  paintPixel: async (x, y, color) => {
    const response = await api.post('/paint', {
      x,
      y,
      color,
    });
    return response.data;
  },

  // Zoom to position
  zoomToPosition: async (level, sectionX, sectionY) => {
    const response = await api.post('/zoom', {
      level,
      section_x: sectionX,
      section_y: sectionY,
    });
    return response.data;
  },

  // Get available colors
  getColors: async () => {
    const response = await api.get('/colors');
    return response.data;
  },
};

