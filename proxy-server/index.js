const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/agencies', async (req, res) => {
  try {
    const response = await axios.get('https://www.ecfr.gov/api/admin/v1/agencies.json');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agencies data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
