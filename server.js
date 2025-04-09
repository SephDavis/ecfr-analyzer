// server.js - Main server file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const app = express();
const port = process.env.PORT || 5000;
const ecfrService = require('./services/ecfrService');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ecfr_analyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB database connection established successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define schemas and models
const agencySchema = new mongoose.Schema({
  agencyId: String,
  name: String,
  shortName: String,
  displayName: String,
  slug: String,
  wordCount: { type: Number, default: 0 },
  regulationCount: { type: Number, default: 0 },
  lastUpdated: Date,
  cfrReferences: [{ 
    title: Number, 
    chapter: String 
  }]
});

const titleSchema = new mongoose.Schema({
  titleNumber: Number,
  name: String,
  wordCount: { type: Number, default: 0 },
  lastUpdated: Date
});

const historicalDataSchema = new mongoose.Schema({
  date: Date,
  totalWordCount: Number,
  titleCounts: Map,
  agencyCounts: Map,
  changes: [{
    entity: String,
    entityType: String, // 'agency' or 'title'
    wordDifference: Number
  }]
});

const Agency = mongoose.model('Agency', agencySchema);
const Title = mongoose.model('Title', titleSchema);
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

app.get('/api/titles', async (req, res) => {
  try {
    const titles = await Title.find();
    res.json(titles);
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
    const searchResults = await ecfrService.searchRegulations(query);
    res.json(searchResults);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/api/corrections', async (req, res) => {
  try {
    const { title, date } = req.query;
    const filters = {};
    
    if (title) filters.title = title;
    if (date) filters.date = date;
    
    const corrections = await ecfrService.getCorrections(filters);
    res.json(corrections);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/api/title/:titleNumber', async (req, res) => {
  try {
    const { titleNumber } = req.params;
    const { date } = req.query;
    
    const structure = await ecfrService.getTitleStructure(titleNumber, date);
    res.json(structure);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Function to fetch and analyze eCFR data
async function fetchAndAnalyzeECFR() {
  try {
    console.log('Fetching eCFR data...');
    
    // 1. Fetch and process agencies
    const agencies = await ecfrService.getAgencies();
    console.log(`Retrieved ${agencies.length} agencies`);
    
    // 2. Fetch and process titles
    const titles = await ecfrService.getTitles();
    console.log(`Retrieved ${titles.length} titles`);
    
    let totalWordCount = 0;
    const titleCounts = new Map();
    const agencyCounts = new Map();
    
    // 3. Process each title to get word counts
    for (const title of titles) {
      try {
        console.log(`Processing Title ${title.number}: ${title.name}`);
        
        // Get title content as XML
        const titleContent = await ecfrService.getTitleContent(title.number);
        
        // Calculate word count
        const wordCount = ecfrService.calculateWordCount(titleContent);
        totalWordCount += wordCount;
        titleCounts.set(title.number.toString(), wordCount);
        
        // Update title record in database
        await Title.findOneAndUpdate(
          { titleNumber: title.number },
          {
            name: title.name,
            wordCount,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error processing title ${title.number}:`, error);
      }
    }
    
    // 4. Process each agency to associate with titles and calculate word counts
    for (const agency of agencies) {
      try {
        console.log(`Processing Agency: ${agency.name}`);
        
        // Calculate word count for agency based on its CFR references
        let agencyWordCount = 0;
        let regulationCount = 0;
        
        if (agency.cfr_references && agency.cfr_references.length > 0) {
          for (const reference of agency.cfr_references) {
            const titleWordCount = titleCounts.get(reference.title.toString()) || 0;
            
            // This is a simplification - in reality we would need to get the actual
            // word count for just the chapters/parts that belong to this agency
            // For now, we'll estimate based on the proportion of the title
            const estimatedAgencyTitleContribution = titleWordCount * 0.1; // assuming agency owns about 10% of title
            agencyWordCount += estimatedAgencyTitleContribution;
            regulationCount += 1;
          }
        }
        
        agencyCounts.set(agency.slug, agencyWordCount);
        
        // Update agency record in database
        await Agency.findOneAndUpdate(
          { agencyId: agency.slug },
          {
            name: agency.name,
            shortName: agency.short_name,
            displayName: agency.display_name,
            slug: agency.slug,
            wordCount: agencyWordCount,
            regulationCount,
            lastUpdated: new Date(),
            cfrReferences: agency.cfr_references
          },
          { upsert: true, new: true }
        );
        
        // Process child agencies if any
        if (agency.children && agency.children.length > 0) {
          for (const childAgency of agency.children) {
            let childWordCount = 0;
            let childRegulationCount = 0;
            
            if (childAgency.cfr_references && childAgency.cfr_references.length > 0) {
              for (const reference of childAgency.cfr_references) {
                const titleWordCount = titleCounts.get(reference.title.toString()) || 0;
                const estimatedChildAgencyTitleContribution = titleWordCount * 0.05; // assuming child agency owns about 5% of title
                childWordCount += estimatedChildAgencyTitleContribution;
                childRegulationCount += 1;
              }
            }
            
            agencyCounts.set(childAgency.slug, childWordCount);
            
            await Agency.findOneAndUpdate(
              { agencyId: childAgency.slug },
              {
                name: childAgency.name,
                shortName: childAgency.short_name,
                displayName: childAgency.display_name,
                slug: childAgency.slug,
                wordCount: childWordCount,
                regulationCount: childRegulationCount,
                lastUpdated: new Date(),
                cfrReferences: childAgency.cfr_references
              },
              { upsert: true, new: true }
            );
          }
        }
      } catch (error) {
        console.error(`Error processing agency ${agency.name}:`, error);
      }
    }
    
    // 5. Create historical record
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
        // Track title changes
        for (const [titleNumber, wordCount] of titleCounts.entries()) {
          const previousCount = previousRecord.titleCounts.get(titleNumber) || 0;
          const difference = wordCount - previousCount;
          
          if (difference !== 0) {
            changes.push({
              entity: titleNumber,
              entityType: 'title',
              wordDifference: difference
            });
          }
        }
        
        // Track agency changes
        for (const [agencySlug, wordCount] of agencyCounts.entries()) {
          const previousCount = previousRecord.agencyCounts.get(agencySlug) || 0;
          const difference = wordCount - previousCount;
          
          if (difference !== 0) {
            changes.push({
              entity: agencySlug,
              entityType: 'agency',
              wordDifference: difference
            });
          }
        }
      }
      
      // Create new historical record
      const newHistoricalData = new HistoricalData({
        date: today,
        totalWordCount,
        titleCounts: Object.fromEntries(titleCounts),
        agencyCounts: Object.fromEntries(agencyCounts),
        changes
      });
      
      await newHistoricalData.save();
      console.log('Created new historical record');
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

// Initial data fetch on server start (uncomment this for production)
// fetchAndAnalyzeECFR();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});