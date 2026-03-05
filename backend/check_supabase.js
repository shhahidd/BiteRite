const axios = require('axios');
const supabaseUrl = 'https://vvuradtmdbftxahfvusu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXJhZHRtZGJmdHhhaGZ2dXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzYyNDIsImV4cCI6MjA4ODIxMjI0Mn0.RDz9W4pUKzaJQkAMA0TBm7I6bQRCVvsVR-K9ULfKlec';

async function check() {
    try {
        const res = await axios.get(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        console.log(Object.keys(res.data.definitions));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
check();
