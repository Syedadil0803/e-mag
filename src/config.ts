/**
 * Application Configuration
 * 
 * Centralized configuration for environment variables.
 * Usage: import CONFIG from '@demo/config';
 */

// Check for required environment variables
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;
const EDITOR_API_URL = import.meta.env.VITE_EDITOR_API_URL as string;

if (!AUTH_API_URL) {
  throw new Error('VITE_AUTH_API_URL is not defined in environment variables');
}

if (!EDITOR_API_URL) {
  throw new Error('VITE_EDITOR_API_URL is not defined in environment variables');
}

const CONFIG = {
  // Auth Backend URL
  AUTH_API_URL,
  
  // Editor Backend URL
  EDITOR_API_URL,
};

export default CONFIG;
