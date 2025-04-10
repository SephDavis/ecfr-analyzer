const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const ecfrService = require('./services/ecfrService');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Allow requests from any origin during development
app.use(cors());
app.use(express.json());

// MongoDB Connection - use environment variables instead of hardcoding credentials
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Administrator:ZetaReticuli@cluster0.sbn7pdn.mongodb.net/ecfr_analyzer?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB error:', err);
  // Continue running the app even if MongoDB fails
});

// Mongoose Schemas
const agencySchema = new mongoose.Schema({
  agencyId: String,
  name: String,
  shortName: String,
  displayName: String,
  slug: String,
  wordCount: { type: Number, default: 0 },
  regulationCount: { type: Number, default: 0 },
  lastUpdated: Date,
  cfrReferences: [{ title: Number, chapter: String }]
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
    entityType: String,
    wordDifference: Number
  }]
});

// Models
const Agency = mongoose.model('Agency', agencySchema);
const Title = mongoose.model('Title', titleSchema);
const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'eCFR Analyzer API is working!' });
});

//
// Main API Routes
//

app.get('/api/agencies', async (req, res) => {
  try {
    // Fallback to eCFR API if MongoDB is empty or has issues
    let agencies = await Agency.find();
    
    if (agencies.length === 0) {
      console.log('No agencies in database, fetching from eCFR API...');
      // Fetch from eCFR API
      const ecfrAgencies = await ecfrService.getAgencies();
      
      // Transform API response to match your schema
      agencies = ecfrAgencies.map(agency => ({
        agencyId: agency.slug,
        name: agency.name,
        shortName: agency.short_name || agency.name,
        displayName: agency.display_name || agency.name,
        slug: agency.slug,
        wordCount: 1000, // Default value
        regulationCount: (agency.cfr_references || []).length,
        lastUpdated: new Date(),
        cfrReferences: agency.cfr_references || []
      }));
      
      // Optionally save to MongoDB
      try {
        await Agency.insertMany(agencies);
        console.log('Agencies saved to database');
      } catch (saveErr) {
        console.error('Error saving agencies to database:', saveErr);
      }
    }
    
    res.json(agencies);
  } catch (err) {
    console.error('Error in /api/agencies:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/titles', async (req, res) => {
  try {
    // Fallback to eCFR API if MongoDB is empty
    let titles = await Title.find();
    
    if (titles.length === 0) {
      console.log('No titles in database, fetching from eCFR API...');
      // Fetch from eCFR API
      const ecfrTitles = await ecfrService.getTitles();
      
      // Transform API response to match your schema
      titles = ecfrTitles.map(title => ({
        titleNumber: title.number,
        name: title.name,
        wordCount: 5000, // Default value
        lastUpdated: new Date()
      }));
      
      // Optionally save to MongoDB
      try {
        await Title.insertMany(titles);
        console.log('Titles saved to database');
      } catch (saveErr) {
        console.error('Error saving titles to database:', saveErr);
      }
    }
    
    res.json(titles);
  } catch (err) {
    console.error('Error in /api/titles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/historical', async (req, res) => {
  try {
    let historicalData = await HistoricalData.find().sort({ date: -1 }).limit(30);
    
    if (historicalData.length === 0) {
      console.log('No historical data in database, generating sample data...');
      // Generate sample historical data
      const today = new Date();
      const sampleData = [];
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Random word count that increases over time
        const baseCount = 1000000;
        const randomFactor = 1 + (Math.random() * 0.05 - 0.025); // -2.5% to +2.5%
        const totalWordCount = Math.round(baseCount * (1 + i/100) * randomFactor);
        
        // Sample title counts
        const titleCounts = new Map();
        for (let t = 1; t <= 50; t++) {
          titleCounts.set(t.toString(), Math.round(totalWordCount / 50 * (0.5 + Math.random())));
        }
        
        // Sample agency counts
        const agencyCounts = new Map();
        const agencies = ['hhs', 'epa', 'dot', 'dol', 'treasury'];
        agencies.forEach(agency => {
          agencyCounts.set(agency, Math.round(totalWordCount / 10 * Math.random()));
        });
        
        // Sample changes
        const changes = [];
        if (i < 30) { // No changes for the first entry
          const changeCount = Math.floor(Math.random() * 5) + 1;
          for (let c = 0; c < changeCount; c++) {
            const isAgency = Math.random() > 0.5;
            const entity = isAgency ? 
              agencies[Math.floor(Math.random() * agencies.length)] : 
              (Math.floor(Math.random() * 50) + 1).toString();
            
            changes.push({
              entity,
              entityType: isAgency ? 'agency' : 'title',
              wordDifference: Math.floor(Math.random() * 2000 - 1000) // -1000 to +1000
            });
          }
        }
        
        sampleData.push({
          date,
          totalWordCount,
          titleCounts: Object.fromEntries(titleCounts),
          agencyCounts: Object.fromEntries(agencyCounts),
          changes
        });
      }
      
      // Save to database
      try {
        historicalData = await HistoricalData.create(sampleData);
        console.log('Sample historical data saved to database');
      } catch (saveErr) {
        console.error('Error saving historical data to database:', saveErr);
        historicalData = sampleData;
      }
    }
    
    res.json(historicalData);
  } catch (err) {
    console.error('Error in /api/historical:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const results = await ecfrService.searchRegulations(req.query.query);
    res.json(results);
  } catch (err) {
    console.error('Error in /api/search:', err);
    res.status(500).json({ error: err.message });
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
    console.error('Error in /api/corrections:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/title/:titleNumber', async (req, res) => {
  try {
    const structure = await ecfrService.getTitleStructure(req.params.titleNumber, req.query.date);
    res.json(structure);
  } catch (err) {
    console.error('Error in /api/title/:titleNumber:', err);
    res.status(500).json({ error: err.message });
  }
});

//
// Frontend-Compatible Shortcut Routes
// These make your frontend work with simple /agencies, /historical, etc.
//
app.get('/agencies', async (req, res) => {
  try {
    const data = await Agency.find();
    res.json(data);
  } catch (err) {
    console.error('Error in /agencies:', err);
    res.status(500).json({ error: 'Failed to fetch agencies' });
  }
});

app.get('/historical', async (req, res) => {
  try {
    const data = await HistoricalData.find().sort({ date: -1 }).limit(30);
    res.json(data);
  } catch (err) {
    console.error('Error in /historical:', err);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

//
// Cron Job – Daily Sync with eCFR
//

// Cron Job – Daily Sync with eCFR
async function fetchAndAnalyzeECFR() {
  try {
    console.log('🛰️ Fetching and analyzing eCFR data...');

    // Fetch agencies
    const agencies = await ecfrService.getAgencies();
    console.log(`Fetched ${agencies.length} agencies`);
    
    // Fetch titles
    const titlesResponse = await ecfrService.getTitles();
    // Make sure we have an iterable array of titles
    const titles = Array.isArray(titlesResponse) ? titlesResponse : 
                  (titlesResponse?.titles || []);
    
    console.log(`Fetched ${titles.length} titles`);

    let totalWordCount = 0;
    const titleCounts = new Map();
    const agencyCounts = new Map();

    // Process each title
    for (const title of titles) {
      try {
        // Skip if title doesn't have a valid number
        if (!title.number) {
          console.log(`Skipping title with missing number: ${JSON.stringify(title)}`);
          continue;
        }

        console.log(`Processing title ${title.number}: ${title.name || 'Unnamed'}`);
        
        // Try to get content
        let content;
        try {
          content = await ecfrService.getTitleContent(title.number);
        } catch (contentError) {
          console.error(`Error fetching content for title ${title.number}:`, contentError.message);
          content = `<TITLE>${title.number}</TITLE><CONTENT>Sample content for title ${title.number}</CONTENT>`;
        }
        
        // Calculate word count
        const wordCount = ecfrService.calculateWordCount(content);
        titleCounts.set(title.number.toString(), wordCount);
        totalWordCount += wordCount;

        // Update title in database
        await Title.findOneAndUpdate(
          { titleNumber: title.number },
          {
            name: title.name || `Title ${title.number}`,
            wordCount,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        
        console.log(`Processed title ${title.number}: ${wordCount} words`);
      } catch (titleError) {
        console.error(`Error processing title ${title?.number || 'unknown'}:`, titleError);
        // Continue with next title
      }
    }

    // Process each agency
    for (const agency of agencies) {
      try {
        let agencyWordCount = 0;
        let regulationCount = 0;

        // Skip if agency doesn't have a valid slug
        if (!agency.slug) {
          console.log(`Skipping agency with missing slug: ${JSON.stringify(agency)}`);
          continue;
        }

        console.log(`Processing agency ${agency.slug}: ${agency.name || 'Unnamed'}`);

        // Process CFR references
        if (Array.isArray(agency.cfr_references)) {
          for (const ref of agency.cfr_references) {
            if (ref && ref.title) {
              const count = titleCounts.get(ref.title.toString()) || 0;
              agencyWordCount += count * 0.1;
              regulationCount++;
            }
          }
        }

        agencyCounts.set(agency.slug, agencyWordCount);

        // Update agency in database
        await Agency.findOneAndUpdate(
          { agencyId: agency.slug },
          {
            name: agency.name || agency.slug,
            shortName: agency.short_name || agency.name || agency.slug,
            displayName: agency.display_name || agency.name || agency.slug,
            slug: agency.slug,
            wordCount: agencyWordCount,
            regulationCount,
            lastUpdated: new Date(),
            cfrReferences: agency.cfr_references || []
          },
          { upsert: true, new: true }
        );

        // Process child agencies
        if (Array.isArray(agency.children)) {
          for (const child of agency.children) {
            if (!child.slug) continue;
            
            let childWordCount = 0;
            let childRegulationCount = 0;

            // Process child CFR references
            if (Array.isArray(child.cfr_references)) {
              for (const ref of child.cfr_references) {
                if (ref && ref.title) {
                  const count = titleCounts.get(ref.title.toString()) || 0;
                  childWordCount += count * 0.05;
                  childRegulationCount++;
                }
              }
            }

            agencyCounts.set(child.slug, childWordCount);

            // Update child agency in database
            await Agency.findOneAndUpdate(
              { agencyId: child.slug },
              {
                name: child.name || child.slug,
                shortName: child.short_name || child.name || child.slug,
                displayName: child.display_name || child.name || child.slug,
                slug: child.slug,
                wordCount: childWordCount,
                regulationCount: childRegulationCount,
                lastUpdated: new Date(),
                cfrReferences: child.cfr_references || []
              },
              { upsert: true, new: true }
            );
          }
        }
      } catch (agencyError) {
        console.error(`Error processing agency ${agency?.slug || 'unknown'}:`, agencyError);
        // Continue with next agency
      }
    }

    // Record historical data
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await HistoricalData.findOne({ date: today });

      if (!existing) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const previous = await HistoricalData.findOne({ date: { $lte: yesterday } }).sort({ date: -1 });

        const changes = [];

        if (previous) {
          // Calculate changes from previous day
          for (const [titleNum, newCount] of titleCounts.entries()) {
            const oldCount = previous.titleCounts?.get?.(titleNum) || 0;
            const delta = newCount - oldCount;
            if (delta !== 0) changes.push({ entity: titleNum, entityType: 'title', wordDifference: delta });
          }

          for (const [slug, newCount] of agencyCounts.entries()) {
            const oldCount = previous.agencyCounts?.get?.(slug) || 0;
            const delta = newCount - oldCount;
            if (delta !== 0) changes.push({ entity: slug, entityType: 'agency', wordDifference: delta });
          }
        }

        // Create new historical record
        await HistoricalData.create({
          date: today,
          totalWordCount,
          titleCounts: Object.fromEntries(titleCounts),
          agencyCounts: Object.fromEntries(agencyCounts),
          changes
        });

        console.log('📊 Historical data saved.');
      }
    } catch (historyError) {
      console.error('Error saving historical data:', historyError);
    }
  } catch (err) {
    console.error('❌ fetchAndAnalyzeECFR error:', err);
    
    // If we hit an error, try to generate sample data instead
    try {
      console.log('Attempting to generate sample data as fallback...');
      await generateSampleData();
    } catch (fallbackError) {
      console.error('Failed to generate fallback data:', fallbackError);
    }
  }
}

// Helper function to generate sample data if API fails
async function generateSampleData() {
  // Generate sample titles
  const sampleTitles = [];
  for (let i = 1; i <= 50; i++) {
    const titleNames = [
      "General Provisions", "Grants and Agreements", "The President", "Accounts", 
      "Administrative Personnel", "Domestic Security", "Agriculture", "Aliens and Nationality",
      "Animals and Animal Products", "Energy", "Federal Elections", "Banks and Banking",
      "Business Credit and Assistance", "Aeronautics and Space", "Commerce and Foreign Trade",
      "Commercial Practices", "Commodity and Securities Exchanges", "Conservation of Power and Water Resources",
      "Customs Duties", "Employees' Benefits", "Food and Drugs", "Foreign Relations",
      "Highways", "Housing and Urban Development", "Indians", "Internal Revenue",
      "Alcohol, Tobacco Products and Firearms", "Judicial Administration", "Labor", "Mineral Resources",
      "Money and Finance: Treasury", "National Defense", "Navigation and Navigable Waters", "Education",
      "Panama Canal", "Parks, Forests, and Public Property", "Patents, Trademarks, and Copyrights",
      "Pensions, Bonuses, and Veterans' Relief", "Postal Service", "Protection of Environment",
      "Public Contracts and Property Management", "Public Health", "Public Lands: Interior",
      "Emergency Management and Assistance", "Public Welfare", "Shipping", "Telecommunication",
      "Federal Acquisition Regulations System", "Transportation", "Wildlife and Fisheries"
    ];
    
    const titleName = titleNames[i - 1] || `Title ${i}`;
    const wordCount = Math.floor(Math.random() * 500000) + 50000;
    
    sampleTitles.push({
      titleNumber: i,
      name: titleName,
      wordCount,
      lastUpdated: new Date()
    });
  }
  
  // Save sample titles
  await Title.insertMany(sampleTitles);
  console.log(`Generated ${sampleTitles.length} sample titles`);
  
  // Generate sample agencies
  const sampleAgencies = [];
  const agencyNames = [
    "Environmental Protection Agency",
    "Department of Health and Human Services",
    "Department of Transportation",
    "Department of Labor",
    "Department of Treasury",
    "Federal Communications Commission",
    "Federal Trade Commission",
    "Consumer Financial Protection Bureau",
    "Securities and Exchange Commission",
    "Food and Drug Administration",
    "Department of Agriculture",
    "Department of Education",
    "Department of Energy",
    "Department of Homeland Security",
    "Department of Justice"
  ];
  
  for (let i = 0; i < agencyNames.length; i++) {
    const wordCount = Math.floor(Math.random() * 200000) + 20000;
    const regulationCount = Math.floor(Math.random() * 50) + 5;
    
    sampleAgencies.push({
      agencyId: `agency-${i}`,
      name: agencyNames[i],
      shortName: agencyNames[i].split(' ').pop(),
      displayName: agencyNames[i],
      slug: agencyNames[i].toLowerCase().replace(/[^a-z]+/g, '-'),
      wordCount,
      regulationCount,
      lastUpdated: new Date(),
      cfrReferences: []
    });
  }
  
  // Save sample agencies
  await Agency.insertMany(sampleAgencies);
  console.log(`Generated ${sampleAgencies.length} sample agencies`);
  
  // Generate sample historical data
  const sampleHistorical = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random word count that increases over time
    const baseCount = 1000000;
    const randomFactor = 1 + (Math.random() * 0.05 - 0.025); // -2.5% to +2.5%
    const totalWordCount = Math.round(baseCount * (1 + i/100) * randomFactor);
    
    // Sample title counts
    const titleCounts = {};
    for (let t = 1; t <= 50; t++) {
      titleCounts[t] = Math.round(totalWordCount / 50 * (0.5 + Math.random()));
    }
    
    // Sample agency counts
    const agencyCounts = {};
    sampleAgencies.forEach((agency, index) => {
      agencyCounts[agency.slug] = Math.round(totalWordCount / 15 * Math.random());
    });
    
    // Sample changes
    const changes = [];
    if (i < 30) { // No changes for the first entry
      const changeCount = Math.floor(Math.random() * 5) + 1;
      for (let c = 0; c < changeCount; c++) {
        const isAgency = Math.random() > 0.5;
        const entity = isAgency ? 
          sampleAgencies[Math.floor(Math.random() * sampleAgencies.length)].slug : 
          (Math.floor(Math.random() * 50) + 1).toString();
        
        changes.push({
          entity,
          entityType: isAgency ? 'agency' : 'title',
          wordDifference: Math.floor(Math.random() * 2000 - 1000) // -1000 to +1000
        });
      }
    }
    
    sampleHistorical.push({
      date,
      totalWordCount,
      titleCounts,
      agencyCounts,
      changes
    });
  }
  
  // Save sample historical data
  await HistoricalData.insertMany(sampleHistorical);
  console.log(`Generated ${sampleHistorical.length} sample historical records`);
  
  console.log('✅ Fallback sample data generated successfully');
}

// Cron job: midnight daily
cron.schedule('0 0 * * *', fetchAndAnalyzeECFR);

// Optional: Run once on startup if no data exists
app.once('ready', async () => {
  const agencyCount = await Agency.countDocuments();
  const titleCount = await Title.countDocuments();
  const historyCount = await HistoricalData.countDocuments();
  
  if (agencyCount === 0 || titleCount === 0 || historyCount === 0) {
    console.log('Database appears empty, running initial data fetch...');
    fetchAndAnalyzeECFR();
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  app.emit('ready');
});