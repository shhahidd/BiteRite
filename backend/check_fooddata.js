const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cpjfpetvaopddakcfnee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwamZwZXR2YW9wZGRha2NmbmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzA3MjQsImV4cCI6MjA5OTI0NjcyNH0.Zw3CceyE4fh7-KRg8B0mIeicW8A-DxdRQHq-k0QdOYc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFoodData() {
    try {
        console.log("Checking FoodData table...");
        const { data, error } = await supabase.from('FoodData').select('*').limit(1);
        if (error) {
            console.error("Error querying FoodData:", error.message);
        } else {
            console.log("FoodData exists! Schema sample:", data);
        }
    } catch (e) {
        console.error("Fatal:", e);
    }
}
checkFoodData();
