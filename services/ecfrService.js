// services/ecfrService.js
const axios = require('axios');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

/**
 * Service to handle eCFR data retrieval and analysis
 */
class ECFRService {
  constructor() {
    this.baseUrl = 'https://www.ecfr.gov';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'eCFR-Analyzer/1.0'
      }
    });
    
    // Cache to avoid repeated requests
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour
    
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
   * Fetch all agencies from eCFR
   */
  async getAgencies() {
    try {
      console.log('Fetching agencies from eCFR API...');
      const data = await this.fetchWithCache('/api/admin/v1/agencies.json');
      const agencies = data.agencies || [];
      console.log(`Successfully fetched ${agencies.length} agencies`);
      return agencies;
    } catch (error) {
      console.error('Error fetching agencies:', error);
      // Return empty array instead of mock data to avoid confusion
      return [];
    }
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
      return titles;
    } catch (error) {
      console.error('Error fetching titles:', error);
      // Return empty array instead of mock data to avoid confusion
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
   * Get full XML content of a title
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional)
   */
  async getTitleContent(title, date = null) {
    if (!date) {
      date = await this.getLatestAvailableDate();
    }
    
    try {
      // Use different request format for XML
      console.log(`Fetching content for title ${title} on date ${date}...`);
      const response = await this.axiosInstance.get(`${this.baseUrl}/api/versioner/v1/full/${date}/title-${title}.xml`, {
        responseType: 'text'
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
   * Calculate word count from XML content
   * @param {string} xmlContent - XML content from eCFR API
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
    
    // Word frequency
    const wordFrequency = {};
    words.forEach(word => {
      const normalized = word.toLowerCase();
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    });
    
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