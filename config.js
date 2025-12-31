// Configuration file - API URL will be injected by Netlify build
// For local development, this will use localhost
// For production, Netlify will replace this during build
const apiUrl = '%%API_URL%%';
window.APP_CONFIG = {
  API_URL: apiUrl.startsWith('%%') ? 'http://localhost:8181' : apiUrl,
  FEATURES: {
    PHASE2_PROFILES: true // Set to true to enable Phase 2 features
  }
};

