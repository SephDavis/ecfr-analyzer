// components/Search.js
import React, { useState } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, Button, 
  CircularProgress, Card, CardContent, Divider, 
  List, ListItem, ListItemText, Chip, Accordion, 
  AccordionSummary, AccordionDetails
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      setResults(response.data.results || []);
      
      setLoading(false);
    } catch (error) {
      setError('An error occurred while searching. Please try again.');
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
    
    // Escape special regex characters in the search term
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regex to find all instances of the search term
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    // Split the text by the regex and put a highlight span around matches
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };
  
  // Function to truncate text and highlight the search term
  const getTruncatedTextWithHighlight = (text, searchTerm, maxLength = 200) => {
    if (!text) return '';
    
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
                          {result.title || 'Untitled Regulation'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.agency} • {result.section || 'No Section'} • {new Date(result.date).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {result.topics && result.topics.map((topic, i) => (
                            <Chip 
                              key={i} 
                              label={topic} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="body2" paragraph>
                          {getTruncatedTextWithHighlight(result.content, query)}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          component="a"
                          href={result.url || '#'}
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