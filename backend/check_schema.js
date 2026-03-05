const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vvuradtmdbftxahfvusu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXJhZHRtZGJmdHhhaGZ2dXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzYyNDIsImV4cCI6MjA4ODIxMjI0Mn0.RDz9W4pUKzaJQkAMA0TBm7I6bQRCVvsVR-K9ULfKlec';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    try {
        console.log("Checking schema...");
        const { data, error } = await supabase.from('user_fridge').select('*').limit(1);
        console.log("Existing columns:", data && data.length > 0 ? Object.keys(data[0]) : "No data");

        // Try inserting with a dummy user_id to see if it's accepted
        const testRes = await supabase.from('user_fridge').insert([{ ingredients: 'test', user_id: 'test_user_id' }]);
        if (testRes.error) {
            console.error("Insert error (might mean user_id column is missing):", testRes.error.message);
        } else {
            console.log("Insert success! 'user_id' column exists.");
            // cleanup
            await supabase.from('user_fridge').delete().eq('user_id', 'test_user_id');
        }
    } catch (e) {
        console.error("Fatal:", e);
    }
}
checkSchema().then(() => console.log("Finished schema check."));
