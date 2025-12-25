// Configuration file - API URL will be injected by Netlify build
// For local development, this will use localhost
// For production, Netlify will replace this during build
window.APP_CONFIG = {
  API_URL: '%%API_URL%%' || 'http://localhost:8181'
};

