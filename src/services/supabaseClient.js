import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xdrrczaeqgsuuxcolvos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcnJjemFlcWdzdXV4Y29sdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODU5NTQsImV4cCI6MjA1Nzc2MTk1NH0.JFqLtvXUHW6ah8A-YhM_G2oJty_dH-Weoc8Isx6koHA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
