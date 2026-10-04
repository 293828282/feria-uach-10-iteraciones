import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://dgrwztzyaqezezzbyuba.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncmd3enR6eWFxZXplenpieXViYSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0NDI0MDA1LCJleHAiOjIwOTk5OTk5OTl9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
