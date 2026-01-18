const apiUrl = '%%API_URL%%';
const supabaseUrl = '%%SUPABASE_URL%%';
const supabaseKey = '%%SUPABASE_KEY%%';

window.APP_CONFIG = {
  API_URL: apiUrl.startsWith('%%') ? 'http://localhost:8181' : apiUrl,
  SUPABASE_URL: supabaseUrl.startsWith('%%') ? 'https://nqbojheiaueqsgtrqsuo.supabase.co' : supabaseUrl,
  SUPABASE_KEY: supabaseKey.startsWith('%%') ? 'sb_publishable_nsS562nV-KoMIMG0psX-Hg_qjZK1srG' : supabaseKey,
  SUPABASE_DB_URL: 'postgresql://postgres:UuvrRys5BmukCFGh@db.nqbojheiaueqsgtrqsuo.supabase.co:5432/postgres',
  FEATURES: {
    PHASE2_PROFILES: true // Set to true to enable Phase 2 features
  }
};

