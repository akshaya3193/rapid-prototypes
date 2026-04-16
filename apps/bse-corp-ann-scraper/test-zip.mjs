import axios from 'axios';

async function testZip() {
  try {
    const pdfs = [
      { filename: '9fa22b6d-dfb3-4c0f-8d9d-c8a344980541.pdf' },
      { filename: 'a77b0341-8db8-4e7c-a5aa-2f7621da7f1d.pdf' }
    ];
    console.log('Sending request to /api/download-zip...');
    const res = await axios.post('http://localhost:3000/api/download-zip', { pdfs }, { responseType: 'arraybuffer' });
    console.log('Response status:', res.status);
    console.log('Response length:', res.data.length);
  } catch (e) {
    console.error('Error:', e.message);
    if (e.response) {
      console.error('Response data:', e.response.data.toString());
    }
  }
}
testZip();
