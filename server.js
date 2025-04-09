// server.js - Main server file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ecfr_analyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define schemas and models
const agencySchema = new mongoose.Schema({
  agencyId: String,
  name: String,
  wordCount: Number,
  regulationCount: Number,
  lastUpdated: Date
});

const historicalDataSchema = new mongoose.Schema({
  date: Date,
  totalWordCount: Number,
  agencyCounts: Map,
  changes: [{
    agencyId: String,
    wordDifference: Number
  }]
});

const Agency = mongoose.model('Agency', agencySchema);
const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

// API Routes
app.get('/api/agencies', async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json(agencies);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/api/historical', async (req, res) => {
  try {
    const historicalData = await HistoricalData.find().sort({ date: -1 }).limit(30);
    res.json(historicalData);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  try {
    // Use eCFR API to search for query
    const response = await axios.get(`https://www.ecfr.gov/api/search?query=${query}`);
    res.json(response.data);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Function to fetch and analyze eCFR data
async function fetchAndAnalyzeECFR() {
  try {
    console.log('Fetching eCFR data...');
    
    // Fetch list of agencies
    const agenciesResponse = await axios.get('https://www.ecfr.gov/api/agencies');
    const agencies = agenciesResponse.data;
    
    let totalWordCount = 0;
    const agencyCounts = new Map();
    
    // Process each agency
    for (const agency of agencies) {
      // Fetch regulations for this agency
      const regulationsResponse = await axios.get(`https://www.ecfr.gov/api/current/${agency.id}`);
      const regulations = regulationsResponse.data;
      
      // Calculate word count for this agency
      let agencyWordCount = 0;
      for (const regulation of regulations) {
        const content = regulation.content || '';
        const words = content.split(/\s+/).filter(word => word.length > 0);
        agencyWordCount += words.length;
      }
      
      totalWordCount += agencyWordCount;
      agencyCounts.set(agency.id, agencyWordCount);
      
      // Update or create agency record
      await Agency.findOneAndUpdate(
        { agencyId: agency.id },
        {
          name: agency.name,
          wordCount: agencyWordCount,
          regulationCount: regulations.length,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }
    
    // Create historical record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have an entry for today
    const existingEntry = await HistoricalData.findOne({ date: today });
    
    if (!existingEntry) {
      // Calculate changes compared to previous record
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const previousRecord = await HistoricalData.findOne({ date: { $lte: yesterday } }).sort({ date: -1 });
      
      const changes = [];
      if (previousRecord) {
        for (const [agencyId, wordCount] of agencyCounts.entries()) {
          const previousCount = previousRecord.agencyCounts.get(agencyId) || 0;
          const difference = wordCount - previousCount;
          
          if (difference !== 0) {
            changes.push({
              agencyId,
              wordDifference: difference
            });
          }
        }
      }
      
      // Create new historical record
      const newHistoricalData = new HistoricalData({
        date: today,
        totalWordCount,
        agencyCounts: Object.fromEntries(agencyCounts),
        changes
      });
      
      await newHistoricalData.save();
    }
    
    console.log('eCFR data analysis complete');
  } catch (error) {
    console.error('Error in fetchAndAnalyzeECFR:', error);
  }
}

// Schedule daily data fetching and analysis (at midnight)
cron.schedule('0 0 * * *', () => {
  fetchAndAnalyzeECFR();
});

// Initial data fetch on server start
fetchAndAnalyzeECFR();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});