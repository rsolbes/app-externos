import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://izozjytmktbuhpttczid.supabase.co'; // <-- TU URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b3pqeXRta3RidWhwdHRjemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTI0OTQsImV4cCI6MjA3NDY4ODQ5NH0.caDSP_Cb_xV7bVq59d_q8Muu8I97GCNvrZAVqAu0Jyg'; // <-- TU ANON PUBLIC

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
