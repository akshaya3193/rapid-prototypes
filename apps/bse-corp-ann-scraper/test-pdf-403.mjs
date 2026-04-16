import axios from 'axios';

async function testPdf() {
  const filenames = [
    '9fa22b6d-dfb3-4c0f-8d9d-c8a344980541.pdf' // This one exists in AttachHis, wait, let's find one in AttachLive
  ];
  
  for (const filename of filenames) {
    const urls = [
      `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${filename}`,
      `https://www.bseindia.com/xml-data/corpfiling/AttachHis/${filename}`
    ];

    for (const url of urls) {
      try {
        console.log(`Trying GET ${url}`);
        const res = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Referer': 'https://www.bseindia.com/',
            'Accept': 'application/pdf,application/json,text/plain,*/*'
          }
        });
        console.log(`Success! Status: ${res.status}`);
      } catch (e) {
        console.error(`Failed: ${e.message}`);
        if (e.response) {
            console.error(`Status: ${e.response.status}`);
        }
      }
    }
  }
}

testPdf();
