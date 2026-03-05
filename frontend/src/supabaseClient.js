import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvuradtmdbftxahfvusu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXJhZHRtZGJmdHhhaGZ2dXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzYyNDIsImV4cCI6MjA4ODIxMjI0Mn0.RDz9W4pUKzaJQkAMA0TBm7I6bQRCVvsVR-K9ULfKlec';

export const supabase = createClient(supabaseUrl, supabaseKey);
