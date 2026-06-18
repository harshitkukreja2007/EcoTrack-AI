const https = require('https');

const candidates = [
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADynrc',
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADyncrc',
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADyncr',
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADync',
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADynr',
  'AIzaSyCvvyGpK9NO4BS3LkYa2LiB5a6ZADyn'
];

function checkKey(key) {
  return new Promise((resolve) => {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error && parsed.error.message === 'API key not valid. Please pass a valid API key.') {
            resolve({ key, valid: false, message: 'Invalid' });
          } else {
            resolve({ key, valid: true, message: parsed.error ? parsed.error.message : 'Success' });
          }
        } catch (e) {
          resolve({ key, valid: false, message: 'JSON Parse Error' });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ key, valid: false, message: e.message });
    });

    req.write(JSON.stringify({ returnSecureToken: true }));
    req.end();
  });
}

async function run() {
  console.log("Testing API key candidates...");
  for (const key of candidates) {
    const res = await checkKey(key);
    console.log(`Key: ${key} -> Valid: ${res.valid} (Response: ${res.message})`);
  }
}

run();
