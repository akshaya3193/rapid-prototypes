import axios from 'axios';

async function test() {
  try {
    const res1 = await axios.get('http://localhost:3000/api/announcements?scripCode=500325&fromDate=20231001&toDate=20240409&pageno=1');
    console.log('Page 1:', res1.data.Table.length);
    const res2 = await axios.get('http://localhost:3000/api/announcements?scripCode=500325&fromDate=20231001&toDate=20240409&pageno=2');
    console.log('Page 2:', res2.data.Table.length);
  } catch (e) {
    console.error(e);
  }
}
test();
