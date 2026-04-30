import axios from 'axios';
import fs from 'fs';

async function testWa(phone, file) {
  try {
    const res = await axios.get(`https://api.whatsapp.com/send/?phone=${phone}&text&type=phone_number&app_absent=0`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    fs.writeFileSync(file, res.data);
    console.log(`Saved ${file}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

testWa('12345678901', 'wa-invalid.html');
