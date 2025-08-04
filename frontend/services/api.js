/**
 * API service for communicating with the Doodlr backend.
 */

import { API_CONFIG } from '../config';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('Making API request to:', url);
    console.log('Request config:', config);

    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed for URL:', url);
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Create a more informative error message
      let errorMessage = 'API request failed';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
      
      throw new Error(errorMessage);
    }
  }

  // Canvas API methods
  async getCanvasRoot() {
    return this.request('/canvas/');
  }

  async getCanvasAtLevel(level, parentX = 0, parentY = 0) {
    return this.request(`/canvas/level/${level}?parent_x=${parentX}&parent_y=${parentY}`);
  }

  async paintSquare(x, y, level, color, userId = null) {
    const params = new URLSearchParams({
      x: x.toString(),
      y: y.toString(),
      level: level.toString(),
      color: color,
    });
    
    if (userId) {
      params.append('user_id', userId);
    }

    return this.request('/canvas/paint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  }

  async zoomToPosition(x, y, level, userId = null) {
    const params = new URLSearchParams({
      x: x.toString(),
      y: y.toString(),
      level: level.toString(),
    });
    
    if (userId) {
      params.append('user_id', userId);
    }

    return this.request(`/canvas/zoom?${params.toString()}`, {
      method: 'POST',
    });
  }

  async getColors() {
    return this.request('/canvas/colors');
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage) {
    const ws = new WebSocket(`${API_CONFIG.WS_URL}/canvas/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return ws;
  }
}

export default new ApiService(); 