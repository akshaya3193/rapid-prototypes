import axios from 'axios';

async function test() {
  try {
    const res = await axios.head('https://www.bseindia.com/xml-data/corpfiling/AttachHis/9fa22b6d-dfb3-4c0f-8d9d-c8a344980541.pdf', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    console.log(res.status);
  } catch (e) {
    console.error(e.message);
  }
}
test();
