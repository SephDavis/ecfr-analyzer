const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const ecfrService = require('./services/ecfrService');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
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

// Memory usage monitoring
function logMemoryUsage(label = '') {
  const memoryUsage = process.memoryUsage();
  console.log(`Memory usage ${label ? '(' + label + ')' : ''}:`);
  console.log(`  RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(`  Heap total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
}

// Schedule memory logging every 5 minutes
setInterval(() => logMemoryUsage('periodic'), 5 * 60 * 1000);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'eCFR Analyzer API is working!' });
});

//
// Main API Routes
//

app.get('/api/agencies', async (req, res) => {
  try {
    // Always fetch fresh from eCFR API first
    console.log('Attempting to fetch fresh agency data from eCFR API...');
    const ecfrAgencies = await ecfrService.getAgencies();
    
    if (ecfrAgencies && ecfrAgencies.length > 0) {
      console.log(`Successfully fetched ${ecfrAgencies.length} agencies from eCFR API`);
      
      // Transform API response to match your schema
      const agencies = ecfrAgencies.map(agency => ({
        agencyId: agency.slug,
        name: agency.name,
        shortName: agency.short_name || agency.name,
        displayName: agency.display_name || agency.name,
        slug: agency.slug,
        wordCount: agency.wordCount || 1000, // Default value
        regulationCount: (agency.cfr_references || []).length,
        lastUpdated: new Date(),
        cfrReferences: agency.cfr_references || []
      }));
      
      // Save to MongoDB
      try {
        await Agency.deleteMany({}); // Clear existing data
        await Agency.insertMany(agencies);
        console.log('Updated agencies saved to database');
      } catch (saveErr) {
        console.error('Error saving agencies to database:', saveErr);
      }
      
      return res.json(agencies);
    }
    
    // If API fetch failed, try to get from database
    console.log('API fetch returned no data, trying database...');
    const dbAgencies = await Agency.find();
    
    if (dbAgencies.length > 0) {
      console.log(`Found ${dbAgencies.length} agencies in database`);
      return res.json(dbAgencies);
    }
    
    // As a last resort, return empty array rather than mock data
    console.log('No agency data available');
    return res.json([]);
  } catch (err) {
    console.error('Error in /api/agencies:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/titles', async (req, res) => {
  try {
    // Always fetch fresh from eCFR API first
    console.log('Attempting to fetch fresh title data from eCFR API...');
    const ecfrTitles = await ecfrService.getTitles();
    
    if (ecfrTitles && ecfrTitles.length > 0) {
      console.log(`Successfully fetched ${ecfrTitles.length} titles from eCFR API`);
      
      // Transform API response to match your schema
      const titles = ecfrTitles.map(title => ({
        titleNumber: title.number,
        name: title.name,
        wordCount: title.wordCount || 5000, // Default value
        lastUpdated: new Date()
      }));
      
      // Save to MongoDB
      try {
        await Title.deleteMany({}); // Clear existing data
        await Title.insertMany(titles);
        console.log('Updated titles saved to database');
      } catch (saveErr) {
        console.error('Error saving titles to database:', saveErr);
      }
      
      return res.json(titles);
    }
    
    // If API fetch failed, try to get from database
    console.log('API fetch returned no data, trying database...');
    const dbTitles = await Title.find();
    
    if (dbTitles.length > 0) {
      console.log(`Found ${dbTitles.length} titles in database`);
      return res.json(dbTitles);
    }
    
    // As a last resort, return empty array rather than mock data
    console.log('No title data available');
    return res.json([]);
  } catch (err) {
    console.error('Error in /api/titles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/historical', async (req, res) => {
  try {
    // First check if we have real historical data
    const historicalData = await HistoricalData.find().sort({ date: -1 }).limit(30);
    
    if (historicalData.length > 0) {
      return res.json(historicalData);
    }
    
    // If no historical data exists, try to generate it from current data
    console.log('No historical data found, attempting to generate from current data...');
    try {
      // Get current data
      const titles = await Title.find();
      const agencies = await Agency.find();
      
      if (titles.length > 0 && agencies.length > 0) {
        // Generate historical data based on current data
        const today = new Date();
        const records = [];
        
        // Create a base record for today
        const totalWordCount = titles.reduce((sum, title) => sum + title.wordCount, 0);
        
        // Title counts
        const titleCounts = {};
        titles.forEach(title => {
          titleCounts[title.titleNumber] = title.wordCount;
        });
        
        // Agency counts
        const agencyCounts = {};
        agencies.forEach(agency => {
          agencyCounts[agency.slug] = agency.wordCount;
        });
        
        // Create today's record
        records.push({
          date: today,
          totalWordCount,
          titleCounts,
          agencyCounts,
          changes: []
        });
        
        // Save to database
        await HistoricalData.create(records);
        console.log('Generated historical data from current state');
        
        return res.json(records);
      }
    } catch (genErr) {
      console.error('Failed to generate historical data:', genErr);
    }
    
    // As a last resort, return empty array
    return res.json([]);
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
    // Redirect to API endpoint to ensure consistency
    const apiResponse = await app._router.handle({ 
      method: 'GET', 
      url: '/api/agencies',
      app,
    }, res);
  } catch (err) {
    console.error('Error in /agencies:', err);
    res.status(500).json({ error: 'Failed to fetch agencies' });
  }
});

app.get('/historical', async (req, res) => {
  try {
    // Redirect to API endpoint to ensure consistency
    const apiResponse = await app._router.handle({ 
      method: 'GET', 
      url: '/api/historical',
      app,
    }, res);
  } catch (err) {
    console.error('Error in /historical:', err);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

/**
 * Process a single title in memory-efficient way
 * @param {Object} title - Title object
 * @param {string} latestDate - Latest available date from API
 * @param {Map} titleCounts - Map to update with title word counts
 * @returns {Promise<number>} - Word count for the title
 */
async function processTitle(title, latestDate, titleCounts) {
  if (!title.number) {
    console.log(`Skipping title with missing number: ${JSON.stringify(title)}`);
    return 0;
  }

  console.log(`Processing title ${title.number}: ${title.name || 'Unnamed'}`);
  
  try {
    // Get title content as a stream
    const contentStream = await ecfrService.getTitleContentStream(title.number, latestDate);
    
    // Calculate word count from stream
    const wordCount = await ecfrService.calculateWordCountFromStream(contentStream);
    console.log(`Processed title ${title.number}: ${wordCount} words`);
    
    // Update title counts
    titleCounts.set(title.number.toString(), wordCount);
    
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
    
    // Free memory
    global.gc && global.gc();
    
    return wordCount;
  } catch (error) {
    console.error(`Error processing title ${title.number}:`, error);
    return 0;
  }
}

//
// Data Analysis Function - Optimized for memory efficiency
//
async function fetchAndAnalyzeECFR() {
  try {
    console.log('🛰️ Fetching and analyzing eCFR data...');
    logMemoryUsage('start');

    // Fetch agencies
    const agencies = await ecfrService.getAgencies();
    console.log(`Fetched ${agencies.length} agencies`);
    
    // Fetch titles
    const titlesResponse = await ecfrService.getTitles();
    // Make sure we have an iterable array of titles
    const titles = Array.isArray(titlesResponse) ? titlesResponse : 
                  (titlesResponse?.titles || []);
    
    console.log(`Fetched ${titles.length} titles`);

    // Early exit if we don't have data
    if (titles.length === 0) {
      console.error('No titles returned from API, aborting data analysis');
      return false;
    }

    let totalWordCount = 0;
    const titleCounts = new Map();
    const agencyCounts = new Map();

    // Get the latest available date from API
    const latestDate = await ecfrService.getLatestAvailableDate();
    console.log(`Using latest available date: ${latestDate}`);

    // Process titles sequentially to save memory
    for (const title of titles) {
      try {
        const wordCount = await processTitle(title, latestDate, titleCounts);
        totalWordCount += wordCount;
        
        // Log memory after each title
        logMemoryUsage(`after title ${title.number}`);
        
        // Add a small delay to allow garbage collection
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (titleError) {
        console.error(`Error in title processing loop for ${title?.number || 'unknown'}:`, titleError);
        // Continue with next title
      }
    }

    // Process each agency
    console.log('Processing agencies...');
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
    
    logMemoryUsage('end');
    console.log('✅ Data analysis completed successfully');
    return true;
  } catch (err) {
    console.error('❌ fetchAndAnalyzeECFR error:', err);
    return false;
  }
}

// Force database refresh for real data
async function forceRefreshData() {
  try {
    console.log('🔄 Force refreshing all data...');
    
    // Clear existing data
    await Agency.deleteMany({});
    await Title.deleteMany({});
    await HistoricalData.deleteMany({});
    
    console.log('🧹 Database cleared, fetching fresh data...');
    
    // Fetch new data
    const success = await fetchAndAnalyzeECFR();
    
    if (success) {
      console.log('✅ Force refresh completed successfully');
    } else {
      console.error('❌ Force refresh failed');
    }
  } catch (err) {
    console.error('❌ forceRefreshData error:', err);
  }
}

// Cron job: midnight daily
cron.schedule('0 0 * * *', () => {
  console.log('🕛 Running scheduled data refresh');
  fetchAndAnalyzeECFR();
});

// Add force refresh endpoint
app.get('/api/force-refresh', async (req, res) => {
  try {
    // Start refresh in background
    forceRefreshData().catch(err => console.error('Background refresh error:', err));
    
    // Respond immediately
    res.json({ message: 'Data refresh initiated, check server logs for progress' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: Run once on startup if no data exists
app.once('ready', async () => {
  try {
    const agencyCount = await Agency.countDocuments();
    const titleCount = await Title.countDocuments();
    
    if (agencyCount === 0 || titleCount === 0) {
      console.log('Database appears empty, running initial data fetch...');
      fetchAndAnalyzeECFR();
    } else {
      console.log(`Database contains ${agencyCount} agencies and ${titleCount} titles`);
    }
  } catch (err) {
    console.error('Error checking database state:', err);
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  app.emit('ready');
});