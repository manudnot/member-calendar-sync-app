const express = require('express');
const cors = require('cors');
const path = require('path');
const feedHandler = require('./api/feed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serverless iCal Feed route matching Vercel configuration
app.get('/api/feed', feedHandler);

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TimeTree-Style Calendar Web App is running locally!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`📲 iCal Feed Endpoint: http://localhost:${PORT}/api/feed?team=true`);
  console.log(`====================================================`);
});
