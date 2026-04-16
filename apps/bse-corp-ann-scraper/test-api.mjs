import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/announcements?scripCode=512527&fromDate=20240101&toDate=20240409');
    console.log(res.data);
  } catch (e) {
    console.error(e);
  }
}
test();
