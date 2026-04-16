import axios from 'axios';

async function testZipLarge() {
  try {
    console.log('Fetching announcements...');
    const resAnn = await axios.get('http://localhost:3000/api/announcements?scripCode=500325&fromDate=20240101&toDate=20240409&pageno=1');
    const pdfs = resAnn.data.Table.filter(a => a.ATTACHMENTNAME).map(a => ({ filename: a.ATTACHMENTNAME }));
    
    console.log(`Found ${pdfs.length} PDFs. Sending request to /api/download-zip...`);
    const res = await axios.post('http://localhost:3000/api/download-zip', { pdfs }, { responseType: 'arraybuffer' });
    console.log('Response status:', res.status);
    console.log('Response length:', res.data.length);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response) {
      if (e.response.data instanceof Buffer) {
        console.error('Response data:', e.response.data.toString('utf8'));
      } else {
        console.error('Response data:', e.response.data);
      }
    }
  }
}
testZipLarge();
