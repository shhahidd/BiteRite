import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpjfpetvaopddakcfnee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwamZwZXR2YW9wZGRha2NmbmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzA3MjQsImV4cCI6MjA5OTI0NjcyNH0.Zw3CceyE4fh7-KRg8B0mIeicW8A-DxdRQHq-k0QdOYc';

export const supabase = createClient(supabaseUrl, supabaseKey);
