/**
 * Configuration file for the Doodlr app.
 * Update the IP_ADDRESS below to match your development machine's IP address.
 */

// Development machine IP address
// You can find this by running 'hostname -I' on your development machine
export const IP_ADDRESS = '192.168.40.214';

// API configuration
export const API_CONFIG = {
  BASE_URL: `http://${IP_ADDRESS}:8000`,
  WS_URL: `ws://${IP_ADDRESS}:8000`,
};

// App configuration
export const APP_CONFIG = {
  MAX_CANVAS_LEVEL: 4,
  SQUARES_PER_LEVEL: 9,
}; 