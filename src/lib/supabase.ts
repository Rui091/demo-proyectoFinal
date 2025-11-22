import { createClient } from '@supabase/supabase-js';

// These should be in .env, but for the demo setup we might need to ask the user or use placeholders.
// Since I cannot create the project, I'll use placeholders and instruct the user.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
