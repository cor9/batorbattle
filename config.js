const apiUrl = '%%API_URL%%';
// Remove strict placeholders for local dev fallback
const supabaseUrl = 'https://nqbojheiaueqsgtrqsuo.supabase.co';
const supabaseKey = 'sb_publishable_nsS562nV-KoMIMG0psX-Hg_qjZK1srG';

window.APP_CONFIG = {
  API_URL: apiUrl.startsWith('%%') ? 'http://localhost:8181' : apiUrl,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_KEY: supabaseKey,
  SUPABASE_DB_URL: 'postgresql://postgres:UuvrRys5BmukCFGh@db.nqbojheiaueqsgtrqsuo.supabase.co:5432/postgres',
  FEATURES: {
    PHASE2_PROFILES: true // Set to true to enable Phase 2 features
  }
};

