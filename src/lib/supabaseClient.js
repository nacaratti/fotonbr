import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdlwkksomchmgngmuftw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbHdra3NvbWNobWduZ211ZnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODk0NTMsImV4cCI6MjA2MzE2NTQ1M30.TmFCkDoSKWGc9TMKwx1wKivr-duMM-2dBaBw3HTma7U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);