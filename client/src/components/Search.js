// components/Search.js
import React, { useState } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, Button, 
  CircularProgress, Card, CardContent, Divider, 
  List, ListItem, ListItemText, Chip, Accordion, 
  AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

// Use the environment variable or fallback to the Railway URL if deployed
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecfr-analyzer-production-ef73.up.railway.app/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      
      console.log(`Searching with API URL: ${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      
      // Format the search results based on the actual eCFR API response structure
      if (response.data && response.data.results) {
        console.log('Search results:', response.data.results);
        setResults(response.data.results);
      } else {
        console.log('No results found in response:', response.data);
        setResults([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError(`An error occurred while searching: ${error.message || 'Unknown error'}. Please try again.`);
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const highlightText = (text, searchTerm) => {
    if (!text) return '';
    
    try {
      // Escape special regex characters in the search term
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create a regex to find all instances of the search term
      const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      
      // Split the text by the regex and put a highlight span around matches
      const parts = text.split(regex);
      
      return parts.map((part, i) => 
        regex.test(part) ? <mark key={i}>{part}</mark> : part
      );
    } catch (e) {
      console.error('Error highlighting text:', e);
      return text; // Return original text if highlighting fails
    }
  };
  
  // Function to truncate text and highlight the search term
  const getTruncatedTextWithHighlight = (text, searchTerm, maxLength = 200) => {
    if (!text) return '';
    
    try {
      // Find the index of the search term (case insensitive)
      const searchTermIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      
      if (searchTermIndex === -1) {
        // If search term not found, just truncate from the beginning
        return text.length > maxLength 
          ? highlightText(text.substring(0, maxLength) + '...', searchTerm)
          : highlightText(text, searchTerm);
      }
      
      // Calculate start and end positions for the text snippet
      const snippetStart = Math.max(0, searchTermIndex - maxLength / 2);
      const snippetEnd = Math.min(text.length, searchTermIndex + searchTerm.length + maxLength / 2);
      
      // Create text snippet with ellipses if truncated
      let textSnippet = '';
      if (snippetStart > 0) textSnippet += '...';
      textSnippet += text.substring(snippetStart, snippetEnd);
      if (snippetEnd < text.length) textSnippet += '...';
      
      return highlightText(textSnippet, searchTerm);
    } catch (e) {
      console.error('Error processing text:', e);
      return text.substring(0, maxLength) + '...'; // Return simple truncated text if processing fails
    }
  };
  
  // Extract title from CFR citation (e.g., "42 CFR 405.1" -> "42")
  const extractTitle = (citation) => {
    if (!citation) return '';
    try {
      const match = citation.match(/^(\d+)\s+CFR/);
      return match ? match[1] : '';
    } catch (e) {
      console.error('Error extracting title:', e);
      return '';
    }
  };
  
  // Generate a URL for the CFR citation
  const getCFRUrl = (citation) => {
    if (!citation) return 'https://www.ecfr.gov';
    try {
      return `https://www.ecfr.gov/current/${citation.replace(/\s+/g, '-').toLowerCase()}`;
    } catch (e) {
      console.error('Error generating URL:', e);
      return 'https://www.ecfr.gov';
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Search Federal Regulations
      </Typography>
      
      {/* Search Box */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by keyword, section, agency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* API URL Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Using API URL: {API_BASE_URL}
      </Alert>
      
      {/* Search Results */}
      {error && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#fdeded' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {searchPerformed && !loading && !error && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {results.length} Results for "{query}"
          </Typography>
          
          {results.length === 0 ? (
            <Typography>
              No regulations found matching your search. Try different keywords or broaden your search.
            </Typography>
          ) : (
            <List>
              {results.map((result, index) => (
                <React.Fragment key={result.id || index}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {result.title || result.citation || 'Untitled Regulation'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.citation || ''} • {result.version_date ? new Date(result.version_date).toLocaleDateString() : 'Current Version'}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {extractTitle(result.citation) && (
                            <Chip 
                              label={`Title ${extractTitle(result.citation)}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          )}
                          {result.agency && (
                            <Chip 
                              label={result.agency} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" paragraph>
                          {getTruncatedTextWithHighlight(result.content || result.snippet || '', query)}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          component="a"
                          href={result.url || getCFRUrl(result.citation)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Full Regulation
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Search;