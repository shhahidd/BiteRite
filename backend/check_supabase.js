const axios = require('axios');
const supabaseUrl = 'https://cpjfpetvaopddakcfnee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwamZwZXR2YW9wZGRha2NmbmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzA3MjQsImV4cCI6MjA5OTI0NjcyNH0.Zw3CceyE4fh7-KRg8B0mIeicW8A-DxdRQHq-k0QdOYc';

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
