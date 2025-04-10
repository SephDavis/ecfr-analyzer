// components/Search.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, Button, 
  CircularProgress, Card, CardContent, Divider, 
  List, ListItem, ListItemText, Chip, Accordion, 
  AccordionSummary, AccordionDetails, alpha, useTheme,
  InputAdornment, IconButton, Tooltip, Alert
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import BusinessIcon from '@mui/icons-material/Business';

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecfr-analyzer-production-ef73.up.railway.app/api';

const Search = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery) => {
    const updatedSearches = [
      searchQuery, 
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      saveRecentSearch(query);
      
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      
      // Format the search results based on the actual eCFR API response structure
      if (response.data && response.data.results) {
        setResults(response.data.results);
      } else {
        setResults([]);
      }
      
      setLoading(false);
    } catch (error) {
      let errorMessage = 'An error occurred while searching';
      
      if (error.response) {
        errorMessage += ` (${error.response.status})`;
      } else if (error.request) {
        errorMessage += ': No response from server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchPerformed(false);
    setError(null);
  };
  
  const handleRecentSearchClick = (searchQuery) => {
    setQuery(searchQuery);
    // We don't call handleSearch() immediately to give user a chance to modify
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
      regex.test(part) ? (
        <Box 
          component="span" 
          key={i} 
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            padding: '0 2px',
            borderRadius: '2px' 
          }}
        >
          {part}
        </Box>
      ) : part
    );
  };
  
  // Function to truncate text and highlight the search term
  const getTruncatedTextWithHighlight = (text, searchTerm, maxLength = 300) => {
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
  
  // Extract title from CFR citation (e.g., "42 CFR 405.1" -> "42")
  const extractTitle = (citation) => {
    if (!citation) return '';
    const match = citation.match(/^(\d+)\s+CFR/);
    return match ? match[1] : '';
  };
  
  // Extract CFR part from citation (e.g., "42 CFR 405.1" -> "405")
  const extractPart = (citation) => {
    if (!citation) return '';
    const match = citation.match(/CFR\s+(\d+)/);
    return match ? match[1] : '';
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0.5 }}>
          Search Federal Regulations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find specific regulations across the entire Code of Federal Regulations
        </Typography>
      </Box>
      
      {/* Search Box */}
      <Card 
        sx={{ 
          p: 3, 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            opacity: 0.04,
            transform: 'rotate(15deg)'
          }}
        >
          <SearchIcon sx={{ fontSize: 200 }} />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by keyword, section, agency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {recentSearches.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    Recent:
                  </Typography>
                  {recentSearches.map((search, index) => (
                    <Chip
                      key={index}
                      label={search}
                      size="small"
                      onClick={() => handleRecentSearchClick(search)}
                      sx={{ 
                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              sx={{ 
                px: 4,
                backgroundColor: theme.palette.primary.main,
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Card>
      
      {/* Search Results */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '& .MuiAlert-icon': {
              color: theme.palette.error.main
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {searchPerformed && !loading && !error && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              {results.length} Results for "{query}"
            </Typography>
            <Chip 
              icon={<LibraryBooksIcon />} 
              label={`${results.length} regulations found`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {results.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No regulations found
              </Typography>
              <Typography color="text.secondary">
                Try different keywords or broaden your search terms.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {results.map((result, index) => (
                <Accordion 
                  key={result.id || index}
                  sx={{
                    mb: 1.5,
                    backgroundColor: 'transparent',
                    backgroundImage: 'none',
                    boxShadow: 'none',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderRadius: `${theme.shape.borderRadius}px !important`,
                    overflow: 'hidden',
                    '&::before': {
                      display: 'none'
                    },
                    '&.Mui-expanded': {
                      margin: 0,
                      mb: 1.5,
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.4),
                      '&.Mui-expanded': {
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {result.title || result.citation || 'Untitled Regulation'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.citation || ''} • {result.version_date ? new Date(result.version_date).toLocaleDateString() : 'Current Version'}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {extractTitle(result.citation) && (
                          <Chip 
                            icon={<LibraryBooksIcon fontSize="small" />}
                            label={`Title ${extractTitle(result.citation)}`} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 'medium'
                            }} 
                          />
                        )}
                        {extractPart(result.citation) && (
                          <Chip 
                            icon={<GavelIcon fontSize="small" />}
                            label={`Part ${extractPart(result.citation)}`} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              fontWeight: 'medium'
                            }} 
                          />
                        )}
                        {result.agency && (
                          <Chip 
                            icon={<BusinessIcon fontSize="small" />}
                            label={result.agency} 
                            size="small" 
                            sx={{ 
                              backgroundColor: alpha(theme.palette.chart[2], 0.1),
                              color: theme.palette.chart[2], 
                              fontWeight: 'medium'
                            }} 
                          />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: 'transparent', p: 3 }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2,
                          lineHeight: 1.7,
                          '& > span': {
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        {getTruncatedTextWithHighlight(result.content || result.snippet || '', query)}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        component="a"
                        href={result.url || `https://www.ecfr.gov/current/${result.citation ? result.citation.replace(/\s+/g, '-').toLowerCase() : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<LinkIcon />}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        View Full Regulation
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </Paper>
      )}
      
      {/* Empty State / Search Tips */}
      {!searchPerformed && !loading && !error && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Search Tips
              </Typography>
              <Typography variant="body2" paragraph>
                Try searching for specific terms, agencies, or citation numbers to locate regulations.
              </Typography>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use quotation marks for exact phrases: "environmental protection"
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Include CFR citations: 42 CFR 405.1
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Search by agency: EPA, FDA, DOT
                </Typography>
                <Typography variant="body2">
                  • Combine terms to narrow results: water quality standards
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {[
                  'Environmental', 'Healthcare', 'Finance', 'Transportation', 
                  'Labor', 'Safety', 'Energy', 'Agriculture', 'Telecommunications',
                  'FDA', 'EPA', 'OSHA', 'FAA', 'FCC'
                ].map((term, index) => (
                  <Chip
                    key={index}
                    label={term}
                    onClick={() => handleRecentSearchClick(term)}
                    sx={{ 
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Search;