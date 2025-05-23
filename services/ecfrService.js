// services/ecfrService.js
const axios = require('axios');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { Readable } = require('stream');
const { createGunzip } = require('zlib');

/**
 * Service to handle eCFR data retrieval and analysis
 */
class ECFRService {
  constructor() {
    this.baseUrl = 'https://www.ecfr.gov';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 180000, // 3 minutes timeout for large titles
      headers: {
        'User-Agent': 'eCFR-Analyzer/1.0',
        'Accept-Encoding': 'gzip, deflate' // Support compression
      },
      decompress: true // Auto-decompress responses
    });
    
    // Cache to avoid repeated requests
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour
    
    // Special cache for word counts (longer expiry)
    this.wordCountCache = new Map();
    this.wordCountCacheExpiry = 1000 * 60 * 60 * 24; // 24 hours
    
    // Track the latest available date for eCFR
    this.latestAvailableDate = null;
  }

  /**
   * Fetch data with caching and error handling
   * @param {string} url - API URL to fetch
   * @param {Object} options - Axios request options
   */
  async fetchWithCache(url, options = {}) {
    const cacheKey = url + JSON.stringify(options);
    const now = Date.now();
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cachedResult = this.cache.get(cacheKey);
      if (now - cachedResult.timestamp < this.cacheExpiry) {
        console.log(`Using cached data for: ${url}`);
        return cachedResult.data;
      }
    }
    
    // Make API request with retries
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        console.log(`Fetching: ${url}`);
        const response = await this.axiosInstance.get(url, options);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: now
        });
        
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${url} (${retries} retries left):`, error.message);
        lastError = error;
        retries--;
        
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }
    
    // If we get here, all retries failed
    console.error(`Failed to fetch ${url} after 3 attempts:`, lastError);
    throw lastError;
  }

  /**
   * Get the latest available date from the eCFR titles API
   */
  async getLatestAvailableDate() {
    if (this.latestAvailableDate) {
      return this.latestAvailableDate;
    }
    
    try {
      console.log('Fetching latest available date from eCFR API...');
      const titlesData = await this.fetchWithCache('/api/versioner/v1/titles.json');
      
      // Find the most recent date from titles
      let latestDate = '2023-01-01'; // Fallback default
      
      if (titlesData && Array.isArray(titlesData.titles)) {
        for (const title of titlesData.titles) {
          if (title.latest_issue_date && title.latest_issue_date > latestDate) {
            latestDate = title.latest_issue_date;
          }
        }
      }
      
      console.log(`Found latest available date: ${latestDate}`);
      this.latestAvailableDate = latestDate;
      return latestDate;
    } catch (error) {
      console.error('Error getting latest available date:', error);
      // Use a fallback date if we can't get the latest
      return '2023-01-01';
    }
  }

  /**
   * Get exact word count for a specific title with caching
   * @param {string} titleNumber - Title number
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<number>} - Exact word count
   */
  async getExactTitleWordCount(titleNumber, date) {
    const cacheKey = `title-${titleNumber}-${date}-wordcount`;
    const now = Date.now();
    
    // Check word count cache
    if (this.wordCountCache.has(cacheKey)) {
      const cachedResult = this.wordCountCache.get(cacheKey);
      if (now - cachedResult.timestamp < this.wordCountCacheExpiry) {
        console.log(`Using cached word count for title ${titleNumber}`);
        return cachedResult.count;
      }
    }
    
    try {
      console.log(`Getting exact word count for title ${titleNumber}...`);
      
      // Get title content as a stream
      const contentStream = await this.getTitleContentStream(titleNumber, date);
      
      // Calculate word count from stream
      const wordCount = await this.calculateWordCountFromStream(contentStream);
      
      // Cache the result
      this.wordCountCache.set(cacheKey, {
        count: wordCount,
        timestamp: now
      });
      
      console.log(`Title ${titleNumber} has ${wordCount} words`);
      return wordCount;
    } catch (error) {
      console.error(`Error getting exact word count for title ${titleNumber}:`, error);
      return 0;
    }
  }

  /**
   * Fetch all agencies from eCFR with exact word counts
   */
  async getAgencies() {
    try {
      console.log('Fetching agencies from eCFR API...');
      const data = await this.fetchWithCache('/api/admin/v1/agencies.json');
      const agencies = data.agencies || [];
      console.log(`Successfully fetched ${agencies.length} agencies`);
      
      // Get latest date
      const date = await this.getLatestAvailableDate();
      
      // Get title word counts
      const titleWordCounts = new Map();
      
      // Get all titles first
      const titlesData = await this.getTitles();
      
      // For each title, get exact word count (only once per title)
      for (const title of titlesData) {
        if (!title.number) continue;
        
        try {
          const titleNumber = title.number.toString();
          const wordCount = await this.getExactTitleWordCount(titleNumber, date);
          titleWordCounts.set(titleNumber, wordCount);
        } catch (err) {
          console.error(`Error getting word count for title ${title.number}:`, err);
        }
      }
      
      // Process agencies with exact word counts
      const processedAgencies = [];
      
      for (const agency of agencies) {
        let agencyWordCount = 0;
        let regulationCount = 0;
        
        // Calculate word count based on CFR references
        if (Array.isArray(agency.cfr_references)) {
          regulationCount = agency.cfr_references.length;
          
          for (const ref of agency.cfr_references) {
            if (ref && ref.title) {
              const titleNumber = ref.title.toString();
              if (titleWordCounts.has(titleNumber)) {
                // Calculate agency's portion of the title
                // Distribute title's words based on the agency's influence
                const titleCount = titleWordCounts.get(titleNumber);
                const agencyTitleWeight = this.calculateAgencyTitleWeight(agency, titleNumber);
                agencyWordCount += Math.round(titleCount * agencyTitleWeight);
              }
            }
          }
        }
        
        processedAgencies.push({
          ...agency,
          wordCount: agencyWordCount,
          regulationCount
        });
      }
      
      return processedAgencies;
    } catch (error) {
      console.error('Error fetching agencies:', error);
      return [];
    }
  }
  
  /**
   * Calculate an agency's weight/influence in a specific title
   * @param {Object} agency - Agency object
   * @param {string} titleNumber - Title number
   * @returns {number} - Weight between 0 and 1
   */
  calculateAgencyTitleWeight(agency, titleNumber) {
    // Count how many references this agency has to this title
    const agencyRefsToTitle = agency.cfr_references.filter(ref => 
      ref.title && ref.title.toString() === titleNumber
    ).length;
    
    // Base weight - if an agency has references to a title, it gets at least this weight
    const baseWeight = 0.1;
    
    // Additional weight based on number of references
    const refWeight = Math.min(0.9, agencyRefsToTitle * 0.05);
    
    return baseWeight + refWeight;
  }

  /**
   * Get all CFR titles
   */
  async getTitles() {
    try {
      console.log('Fetching titles from eCFR API...');
      const data = await this.fetchWithCache('/api/versioner/v1/titles.json');
      const titles = data.titles || [];
      console.log(`Successfully fetched ${titles.length} titles`);
      
      // Get latest date
      const date = await this.getLatestAvailableDate();
      
      // Get exact word counts for each title
      const processedTitles = [];
      
      for (const title of titles) {
        if (!title.number) continue;
        
        try {
          const titleNumber = title.number.toString();
          const wordCount = await this.getExactTitleWordCount(titleNumber, date);
          
          processedTitles.push({
            ...title,
            wordCount
          });
        } catch (err) {
          console.error(`Error processing title ${title.number}:`, err);
          processedTitles.push({
            ...title,
            wordCount: 0
          });
        }
      }
      
      return processedTitles;
    } catch (error) {
      console.error('Error fetching titles:', error);
      return [];
    }
  }

  /**
   * Get structure of a specific title
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to latest available date)
   */
  async getTitleStructure(title, date = null) {
    if (!date) {
      date = await this.getLatestAvailableDate();
    }
    
    try {
      return await this.fetchWithCache(`/api/versioner/v1/structure/${date}/title-${title}.json`);
    } catch (error) {
      console.error(`Error fetching structure for title ${title}:`, error);
      throw error;
    }
  }

  /**
   * Get full XML content of a title as a stream to save memory
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional)
   * @returns {Promise<stream.Readable>} - Stream of XML content
   */
  async getTitleContentStream(title, date = null) {
    if (!date) {
      date = await this.getLatestAvailableDate();
    }
    
    try {
      // Use streaming to handle large XML files
      console.log(`Fetching content for title ${title} on date ${date} as stream...`);
      const response = await this.axiosInstance.get(
        `/api/versioner/v1/full/${date}/title-${title}.xml`, 
        {
          responseType: 'stream'
        }
      );
      
      console.log(`Successfully fetched content stream for title ${title}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching content stream for title ${title}:`, error);
      
      // Return a minimal XML as a stream for fallback
      const fallbackContent = `<TITLE>${title}</TITLE><CONTENT>Content temporarily unavailable for title ${title}</CONTENT>`;
      const stream = new Readable();
      stream.push(fallbackContent);
      stream.push(null);
      return stream;
    }
  }

  /**
   * Get full XML content of a title (limited size for small titles)
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional)
   */
  async getTitleContent(title, date = null) {
    if (!date) {
      date = await this.getLatestAvailableDate();
    }
    
    try {
      // Use response type 'text' for XML
      console.log(`Fetching content for title ${title} on date ${date}...`);
      const response = await this.axiosInstance.get(`/api/versioner/v1/full/${date}/title-${title}.xml`, {
        responseType: 'text',
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        timeout: 30000 // 30 seconds
      });
      
      console.log(`Successfully fetched content for title ${title}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching content for title ${title}:`, error);
      // Return a minimal XML for fallback
      return `<TITLE>${title}</TITLE><CONTENT>Content temporarily unavailable for title ${title}</CONTENT>`;
    }
  }

  /**
   * Calculate word count from XML content string
   * @param {string} xmlContent - XML content string
   * @returns {number} - Word count
   */
  calculateWordCount(xmlContent) {
    if (!xmlContent) return 0;
    
    // Remove XML tags to get plain text
    const plainText = xmlContent.replace(/<[^>]+>/g, ' ');
    
    // Count words
    const words = tokenizer.tokenize(plainText);
    return words.length;
  }

  /**
   * Calculate word count from XML stream to save memory
   * @param {stream.Readable} xmlStream - Stream of XML content
   * @returns {Promise<number>} - Word count
   */
  calculateWordCountFromStream(xmlStream) {
    return new Promise((resolve, reject) => {
      let wordCount = 0;
      let buffer = '';
      
      xmlStream.on('data', (chunk) => {
        try {
          // Process chunk of data
          const text = buffer + chunk.toString();
          
          // Remove XML tags
          const plainText = text.replace(/<[^>]+>/g, ' ');
          
          // Count words
          const words = tokenizer.tokenize(plainText);
          wordCount += words.length;
          
          // Keep any partial word at the end for next chunk
          const lastSpaceIndex = plainText.lastIndexOf(' ');
          if (lastSpaceIndex !== -1 && lastSpaceIndex < plainText.length - 1) {
            buffer = plainText.substring(lastSpaceIndex + 1);
          } else {
            buffer = '';
          }
        } catch (err) {
          console.error('Error processing XML chunk:', err);
          // Continue processing even if one chunk fails
        }
      });
      
      xmlStream.on('end', () => {
        console.log(`Stream processing complete, counted ${wordCount} words`);
        resolve(wordCount);
      });
      
      xmlStream.on('error', (err) => {
        console.error('Error in XML stream:', err);
        reject(err);
      });
    });
  }

  /**
   * Get all corrections for a specific title
   * @param {string} title - Title number
   */
  async getTitleCorrections(title) {
    try {
      const data = await this.fetchWithCache(`/api/admin/v1/corrections/title/${title}.json`);
      return data.ecfr_corrections || [];
    } catch (error) {
      console.error(`Error fetching corrections for title ${title}:`, error);
      return [];
    }
  }

  /**
   * Get all corrections with optional filters
   * @param {Object} filters - Optional filters (date, title, error_corrected_date)
   */
  async getCorrections(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.title) queryParams.append('title', filters.title);
      if (filters.error_corrected_date) queryParams.append('error_corrected_date', filters.error_corrected_date);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const data = await this.fetchWithCache(`/api/admin/v1/corrections.json${queryString}`);
      
      return data.ecfr_corrections || [];
    } catch (error) {
      console.error('Error fetching corrections:', error);
      return [];
    }
  }

  /**
   * Search for regulations containing specific terms
   * @param {string} query - Search query
   */
  async searchRegulations(query) {
    if (!query || query.trim() === '') {
      return { results: [] };
    }
    
    try {
      return await this.fetchWithCache(`/api/search/v1/results?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error searching regulations:', error);
      // Return empty results
      return { 
        results: [], 
        count: 0,
        query: query
      };
    }
  }

  /**
   * Get search result count
   * @param {string} query - Search query
   */
  async getSearchCount(query) {
    if (!query || query.trim() === '') {
      return { count: 0 };
    }
    
    try {
      return await this.fetchWithCache(`/api/search/v1/count?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error fetching search count:', error);
      return { count: 0 };
    }
  }

  /**
   * Get versions of a specific title to track historical changes
   * @param {string} title - Title number
   */
  async getTitleVersions(title) {
    try {
      return await this.fetchWithCache(`/api/versioner/v1/versions/title-${title}.json`);
    } catch (error) {
      console.error(`Error fetching versions for title ${title}:`, error);
      return { versions: [] };
    }
  }

  /**
   * Analyze text to extract metrics
   * @param {string} text - The text to analyze
   */
  analyzeText(text) {
    if (!text) return { wordCount: 0, sentenceCount: 0, complexity: 0 };
    
    // Word count
    const words = tokenizer.tokenize(text);
    const wordCount = words.length;
    
    // Sentence count
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Average words per sentence (complexity metric)
    const complexity = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Word frequency - limited to top 1000 words to save memory
    const wordFrequency = {};
    let wordCount1000 = 0;
    
    for (const word of words) {
      if (wordCount1000 >= 1000) break;
      
      const normalized = word.toLowerCase();
      if (!wordFrequency[normalized]) {
        wordFrequency[normalized] = 1;
        wordCount1000++;
      } else {
        wordFrequency[normalized]++;
      }
    }
    
    return {
      wordCount,
      sentenceCount,
      complexity,
      wordFrequency
    };
  }

  /**
   * Get the current date in YYYY-MM-DD format
   * Uses the latest available date from eCFR API if available
   */
  async getCurrentDate() {
    return await this.getLatestAvailableDate();
  }

  /**
   * Compare versions to identify changes
   * @param {string} oldXml - XML content of older version
   * @param {string} newXml - XML content of newer version
   */
  compareVersions(oldXml, newXml) {
    const oldWordCount = this.calculateWordCount(oldXml);
    const newWordCount = this.calculateWordCount(newXml);
    
    return {
      added: Math.max(0, newWordCount - oldWordCount),
      removed: Math.max(0, oldWordCount - newWordCount),
      netChange: newWordCount - oldWordCount,
      oldWordCount,
      newWordCount,
      percentChange: oldWordCount ? ((newWordCount - oldWordCount) / oldWordCount) * 100 : 0
    };
  }
}

module.exports = new ECFRService();