import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const id = '6970bfe8fd1d81e93ebed203';
const url = `http://localhost:3001/api/Service/update/${id}`;
const filePath = path.join(process.cwd(), 'uploads', '1769767637605-carpet.jfif');
if (!fs.existsSync(filePath)) {
  console.error('file missing:', filePath);
  process.exit(1);
}

const form = new FormData();
form.append('name', 'Test Service Updated');
form.append('description', 'Updated description');
form.append('price_info', '99');
form.append('category', 'Test');
form.append('commissionPercent', '15');
form.append('image', fs.createReadStream(filePath));

const res = await fetch(url, {
  method: 'PUT',
  body: form,
  headers: form.getHeaders(),
});
console.log('status', res.status);
const text = await res.text();
console.log(text);
