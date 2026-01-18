const apiUrl = '%%API_URL%%';
// Remove strict placeholders for local dev fallback
const supabaseUrl = 'https://nqbojheiaueqsgtrqsuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYm9qaGVpYXVlcXNndHJxc3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTQ3ODksImV4cCI6MjA4NDMzMDc4OX0.RtSa3sI9dubVE6RSHu4CERmwQWJ41zEQqTBFw1HjMrY';

window.APP_CONFIG = {
  API_URL: apiUrl.startsWith('%%') ? 'http://localhost:8181' : apiUrl,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: supabaseKey,
  SUPABASE_DB_URL: 'postgresql://postgres:UuvrRys5BmukCFGh@db.nqbojheiaueqsgtrqsuo.supabase.co:5432/postgres',
  FEATURES: {
    PHASE2_PROFILES: true // Set to true to enable Phase 2 features
  }
};

