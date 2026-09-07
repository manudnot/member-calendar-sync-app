import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://aevutuguijjakfhulgjd.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU";

const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const supaUrl = urlParams?.get('supaUrl') || (typeof localStorage !== 'undefined' && localStorage.getItem('SUPABASE_URL')) || DEFAULT_SUPABASE_URL;
const supaKey = urlParams?.get('supaKey') || (typeof localStorage !== 'undefined' && localStorage.getItem('SUPABASE_ANON_KEY')) || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supaUrl, supaKey);
