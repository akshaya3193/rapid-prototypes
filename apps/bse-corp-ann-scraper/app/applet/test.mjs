import https from 'https';

const options = {
  hostname: 'api.bseindia.com',
  path: '/BseIndiaAPI/api/AnnGetData/w?strCat=-1&strPrevDate=20240101&strScrip=512527&strSearch=P&strToDate=20240409&strType=C',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
