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
  }

  /**
   * Fetch all agencies from eCFR
   */
  async getAgencies() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/admin/v1/agencies.json`);
      return response.data.agencies;
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  }

  /**
   * Get all CFR titles
   */
  async getTitles() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/versioner/v1/titles.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching titles:', error);
      throw error;
    }
  }

  /**
   * Get structure of a specific title
   * @param {string} title - Title number
   * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to current date)
   */
  async getTitleStructure(title, date = this.getCurrentDate()) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/versioner/v1/structure/${date}/title-${title}.json`);
      return response.data;
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
      const response = await axios.get(`${this.baseUrl}/api/versioner/v1/full/${date}/title-${title}.xml`, {
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching content for title ${title}:`, error);
      throw error;
    }
  }

  /**
   * Get all corrections for a specific title
   * @param {string} title - Title number
   */
  async getTitleCorrections(title) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/admin/v1/corrections/title/${title}.json`);
      return response.data.ecfr_corrections;
    } catch (error) {
      console.error(`Error fetching corrections for title ${title}:`, error);
      throw error;
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
      const response = await axios.get(`${this.baseUrl}/api/admin/v1/corrections.json${queryString}`);
      
      return response.data.ecfr_corrections;
    } catch (error) {
      console.error('Error fetching corrections:', error);
      throw error;
    }
  }

  /**
   * Search for regulations containing specific terms
   * @param {string} query - Search query
   */
  async searchRegulations(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/search/v1/results?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching regulations:', error);
      throw error;
    }
  }

  /**
   * Get search result count
   * @param {string} query - Search query
   */
  async getSearchCount(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/search/v1/count?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search count:', error);
      throw error;
    }
  }

  /**
   * Get versions of a specific title to track historical changes
   * @param {string} title - Title number
   */
  async getTitleVersions(title) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/versioner/v1/versions/title-${title}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for title ${title}:`, error);
      throw error;
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
    const date = new Date();
    return date.toISOString().split('T')[0];
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