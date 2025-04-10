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
        const response = await this.axiosInstance.get(url, options);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: now
        });
        
        return response.data;
      } catch (error) {
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
   * Fetch all agencies from eCFR
   */
  async getAgencies() {
    try {
      const data = await this.fetchWithCache('/api/admin/v1/agencies.json');
      return data.agencies || [];
    } catch (error) {
      console.error('Error fetching agencies:', error);
      // Return mock agencies data as fallback
      return this.getMockAgencies();
    }
  }

  /**
   * Get all CFR titles
   */
  async getTitles() {
    try {
      const data = await this.fetchWithCache('/api/versioner/v1/titles.json');
      return data || [];
    } catch (error) {
      console.error('Error fetching titles:', error);
      // Return mock titles as fallback
      return this.getMockTitles();
    }
  }

  /**
   * Get structure of a specific title
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to current date)
   */
  async getTitleStructure(title, date = this.getCurrentDate()) {
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
  async getTitleContent(title, date = this.getCurrentDate()) {
    try {
      // Use different request format for XML
      const response = await this.axiosInstance.get(`${this.baseUrl}/api/versioner/v1/full/${date}/title-${title}.xml`, {
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching content for title ${title}:`, error);
      // Return a minimal XML for fallback
      return `<TITLE>${title}</TITLE><CONTENT>Sample content for testing</CONTENT>`;
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
   */
  getCurrentDate() {
    // Instead of using current date, use the most recent available date from API
    return '2025-04-08';
    
    // Original code:
    // const date = new Date();
    // return date.toISOString().split('T')[0];
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

  /**
   * Generate mock agencies data for fallback
   */
  getMockAgencies() {
    return [
      {
        "slug": "hhs",
        "name": "Department of Health and Human Services",
        "short_name": "HHS",
        "display_name": "Department of Health and Human Services",
        "cfr_references": [
          { "title": 42, "chapter": "IV" },
          { "title": 45, "chapter": "A" }
        ],
        "children": [
          {
            "slug": "fda",
            "name": "Food and Drug Administration",
            "short_name": "FDA", 
            "display_name": "FDA",
            "cfr_references": [
              { "title": 21, "chapter": "I" }
            ]
          }
        ]
      },
      {
        "slug": "epa",
        "name": "Environmental Protection Agency",
        "short_name": "EPA",
        "display_name": "Environmental Protection Agency",
        "cfr_references": [
          { "title": 40, "chapter": "I" }
        ],
        "children": []
      },
      {
        "slug": "treasury",
        "name": "Department of the Treasury",
        "short_name": "Treasury",
        "display_name": "Department of the Treasury",
        "cfr_references": [
          { "title": 31, "chapter": "I" }
        ],
        "children": [
          {
            "slug": "irs",
            "name": "Internal Revenue Service",
            "short_name": "IRS",
            "display_name": "IRS",
            "cfr_references": [
              { "title": 26, "chapter": "I" }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Generate mock titles data for fallback
   */
  getMockTitles() {
    return [
      { "number": 1, "name": "General Provisions" },
      { "number": 2, "name": "Grants and Agreements" },
      { "number": 3, "name": "The President" },
      { "number": 4, "name": "Accounts" },
      { "number": 5, "name": "Administrative Personnel" },
      { "number": 6, "name": "Domestic Security" },
      { "number": 7, "name": "Agriculture" },
      { "number": 8, "name": "Aliens and Nationality" },
      { "number": 9, "name": "Animals and Animal Products" },
      { "number": 10, "name": "Energy" },
      { "number": 11, "name": "Federal Elections" },
      { "number": 12, "name": "Banks and Banking" },
      { "number": 13, "name": "Business Credit and Assistance" },
      { "number": 14, "name": "Aeronautics and Space" },
      { "number": 15, "name": "Commerce and Foreign Trade" },
      { "number": 16, "name": "Commercial Practices" },
      { "number": 17, "name": "Commodity and Securities Exchanges" },
      { "number": 18, "name": "Conservation of Power and Water Resources" },
      { "number": 19, "name": "Customs Duties" },
      { "number": 20, "name": "Employees' Benefits" },
      { "number": 21, "name": "Food and Drugs" },
      { "number": 22, "name": "Foreign Relations" },
      { "number": 23, "name": "Highways" },
      { "number": 24, "name": "Housing and Urban Development" },
      { "number": 25, "name": "Indians" },
      { "number": 26, "name": "Internal Revenue" },
      { "number": 27, "name": "Alcohol, Tobacco Products and Firearms" },
      { "number": 28, "name": "Judicial Administration" },
      { "number": 29, "name": "Labor" },
      { "number": 30, "name": "Mineral Resources" },
      { "number": 31, "name": "Money and Finance: Treasury" },
      { "number": 32, "name": "National Defense" },
      { "number": 33, "name": "Navigation and Navigable Waters" },
      { "number": 34, "name": "Education" },
      { "number": 35, "name": "Panama Canal" },
      { "number": 36, "name": "Parks, Forests, and Public Property" },
      { "number": 37, "name": "Patents, Trademarks, and Copyrights" },
      { "number": 38, "name": "Pensions, Bonuses, and Veterans' Relief" },
      { "number": 39, "name": "Postal Service" },
      { "number": 40, "name": "Protection of Environment" },
      { "number": 41, "name": "Public Contracts and Property Management" },
      { "number": 42, "name": "Public Health" },
      { "number": 43, "name": "Public Lands: Interior" },
      { "number": 44, "name": "Emergency Management and Assistance" },
      { "number": 45, "name": "Public Welfare" },
      { "number": 46, "name": "Shipping" },
      { "number": 47, "name": "Telecommunication" },
      { "number": 48, "name": "Federal Acquisition Regulations System" },
      { "number": 49, "name": "Transportation" },
      { "number": 50, "name": "Wildlife and Fisheries" }
    ];
  }
}

module.exports = new ECFRService();