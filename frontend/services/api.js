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

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
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

    return this.request('/canvas/zoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
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