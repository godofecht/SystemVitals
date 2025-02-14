const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Sample data
const sampleData = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
  { label: 'C', value: 15 },
  { label: 'D', value: 25 },
  { label: 'E', value: 30 }
];

app.get('/api/data', (req, res) => {
  res.json(sampleData);
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
}); 