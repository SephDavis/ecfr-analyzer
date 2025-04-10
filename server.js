const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const ecfrService = require('./services/ecfrService');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// In server.js, update the CORS middleware
app.use(cors({
  origin: 'https://reticulitech-ecfr-analyzer.pages.dev',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(
  'mongodb+srv://Administrator:ZetaReticuli@cluster0.sbn7pdn.mongodb.net/ecfr_analyzer?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

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

//
// Main API Routes (all still accessible via /api/...)
//

app.get('/api/agencies', async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json(agencies);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/titles', async (req, res) => {
  try {
    const titles = await Title.find();
    res.json(titles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/historical', async (req, res) => {
  try {
    const historicalData = await HistoricalData.find().sort({ date: -1 }).limit(30);
    res.json(historicalData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const results = await ecfrService.searchRegulations(req.query.query);
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/title/:titleNumber', async (req, res) => {
  try {
    const structure = await ecfrService.getTitleStructure(req.params.titleNumber, req.query.date);
    res.json(structure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//
// ✅ Frontend-Compatible Shortcut Routes
// These make your frontend work with simple /agencies, /historical, etc.
//
app.get('/agencies', async (req, res) => {
  try {
    const data = await Agency.find();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agencies' });
  }
});

app.get('/historical', async (req, res) => {
  try {
    const data = await HistoricalData.find().sort({ date: -1 }).limit(30);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

//
// Cron Job – Daily Sync with eCFR
//

async function fetchAndAnalyzeECFR() {
  try {
    console.log('🛰️ Fetching and analyzing eCFR data...');

    const agencies = await ecfrService.getAgencies();
    const titles = await ecfrService.getTitles();

    let totalWordCount = 0;
    const titleCounts = new Map();
    const agencyCounts = new Map();

    for (const title of titles) {
      const content = await ecfrService.getTitleContent(title.number);
      const wordCount = ecfrService.calculateWordCount(content);
      titleCounts.set(title.number.toString(), wordCount);
      totalWordCount += wordCount;

      await Title.findOneAndUpdate(
        { titleNumber: title.number },
        {
          name: title.name,
          wordCount,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    for (const agency of agencies) {
      let agencyWordCount = 0;
      let regulationCount = 0;

      for (const ref of agency.cfr_references || []) {
        const count = titleCounts.get(ref.title.toString()) || 0;
        agencyWordCount += count * 0.1;
        regulationCount++;
      }

      agencyCounts.set(agency.slug, agencyWordCount);

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

      for (const child of agency.children || []) {
        let childWordCount = 0;
        let childRegulationCount = 0;

        for (const ref of child.cfr_references || []) {
          const count = titleCounts.get(ref.title.toString()) || 0;
          childWordCount += count * 0.05;
          childRegulationCount++;
        }

        agencyCounts.set(child.slug, childWordCount);

        await Agency.findOneAndUpdate(
          { agencyId: child.slug },
          {
            name: child.name,
            shortName: child.short_name,
            displayName: child.display_name,
            slug: child.slug,
            wordCount: childWordCount,
            regulationCount: childRegulationCount,
            lastUpdated: new Date(),
            cfrReferences: child.cfr_references
          },
          { upsert: true, new: true }
        );
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await HistoricalData.findOne({ date: today });

    if (!existing) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const previous = await HistoricalData.findOne({ date: { $lte: yesterday } }).sort({ date: -1 });

      const changes = [];

      if (previous) {
        for (const [titleNum, newCount] of titleCounts.entries()) {
          const old = previous.titleCounts.get(titleNum) || 0;
          const delta = newCount - old;
          if (delta !== 0) changes.push({ entity: titleNum, entityType: 'title', wordDifference: delta });
        }

        for (const [slug, newCount] of agencyCounts.entries()) {
          const old = previous.agencyCounts.get(slug) || 0;
          const delta = newCount - old;
          if (delta !== 0) changes.push({ entity: slug, entityType: 'agency', wordDifference: delta });
        }
      }

      await HistoricalData.create({
        date: today,
        totalWordCount,
        titleCounts: Object.fromEntries(titleCounts),
        agencyCounts: Object.fromEntries(agencyCounts),
        changes
      });

      console.log('📊 Historical data saved.');
    }
  } catch (err) {
    console.error('❌ fetchAndAnalyzeECFR error:', err);
  }
}

// Cron job: midnight daily
cron.schedule('0 0 * * *', fetchAndAnalyzeECFR);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
