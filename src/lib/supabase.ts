import { createClient } from '@supabase/supabase-js'

// Wir schreiben die Werte hart rein, damit es SOFORT funktioniert:
const supabaseUrl = 'https://jhopmncvzcscubkpxupx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3BtbmN2emNzY3Via3B4dXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTM1NTksImV4cCI6MjA4NTAyOTU1OX0.Apo-4AhqN1p3hBxj4D0UcP3HQyxkEjkg65SvVz4Ulqo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)