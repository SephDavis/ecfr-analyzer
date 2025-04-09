// services/ecfrService.js
const axios = require('axios');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

/**
 * Service to handle eCFR data retrieval and analysis
 */
class ECFRService {
  constructor() {
    this.baseUrl = 'https://www.ecfr.gov/api';
  }

  /**
   * Fetch all agencies from eCFR
   */
  async getAgencies() {
    try {
      const response = await axios.get(`${this.baseUrl}/agencies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  }

  /**
   * Fetch regulations for a specific agency
   * @param {string} agencyId - The ID of the agency
   */
  async getAgencyRegulations(agencyId) {
    try {
      const response = await axios.get(`${this.baseUrl}/current/${agencyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching regulations for agency ${agencyId}:`, error);
      throw error;
    }
  }

  /**
   * Get historical versions of a regulation
   * @param {string} titleNum - Title number
   * @param {string} partNum - Part number
   */
  async getHistoricalVersions(titleNum, partNum) {
    try {
      const response = await axios.get(`${this.baseUrl}/historical/title-${titleNum}/part-${partNum}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical versions for title ${titleNum}, part ${partNum}:`, error);
      throw error;
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
   * Calculate complexity score for regulations
   * Higher score indicates more complex language
   * @param {object} regulation - Regulation object
   */
  calculateComplexityScore(regulation) {
    if (!regulation || !regulation.content) return 0;
    
    const { wordCount, sentenceCount, complexity } = this.analyzeText(regulation.content);
    
    // Factors that influence complexity:
    // 1. Average sentence length
    // 2. Presence of legal jargon (could be expanded)
    // 3. Document length
    
    // Simple scoring algorithm
    let score = complexity;
    
    // Longer documents tend to be more complex
    if (wordCount > 1000) score += 1;
    if (wordCount > 5000) score += 2;
    
    return Math.round(score * 10) / 10;
  }

  /**
   * Search for regulations containing specific terms
   * @param {string} query - Search query
   */
  async searchRegulations(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching regulations:', error);
      throw error;
    }
  }

  /**
   * Compare two versions of a regulation to identify changes
   * @param {object} oldVersion - Previous version
   * @param {object} newVersion - Current version
   */
  compareVersions(oldVersion, newVersion) {
    if (!oldVersion || !newVersion) return { added: 0, removed: 0, changes: [] };
    
    const oldWords = tokenizer.tokenize(oldVersion.content || '');
    const newWords = tokenizer.tokenize(newVersion.content || '');
    
    return {
      added: Math.max(0, newWords.length - oldWords.length),
      removed: Math.max(0, oldWords.length - newWords.length),
      netChange: newWords.length - oldWords.length,
      oldWordCount: oldWords.length,
      newWordCount: newWords.length,
      percentChange: oldWords.length ? ((newWords.length - oldWords.length) / oldWords.length) * 100 : 0
    };
  }
}

module.exports = new ECFRService();