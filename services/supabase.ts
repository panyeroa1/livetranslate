import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byhmacidmneojdtwxcgz.supabase.co';
const supabaseKey = 'sb_publishable_HFKWsOjJ1dQJ1kpqAURvVA_Kvo6NIwx';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to ensure we follow Eburon branding in data contexts
export const EBURON_DOMAIN = 'eburon.ai';
