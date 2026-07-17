const https = require('https');
require('dotenv').config({ path: '.env.local' });

const options = {
  hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const swagger = JSON.parse(data);
      const tables = Object.keys(swagger.definitions || {}).filter(k => !k.includes('_'));
      console.log('Tables exposed via API:', Object.keys(swagger.definitions || {}).join(', '));
      if (!swagger.definitions?.gedung) {
         console.log('\nERROR: API DOES NOT EXPOSE GEDUNG!');
         console.log('RAW SWAGGER:', JSON.stringify(swagger).substring(0, 500));
      } else {
         console.log('\nSUCCESS: API EXPOSES GEDUNG!');
      }
    } catch (e) {
      console.log('Error parsing swagger:', e.message);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
