import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Chip,
  Card, CardContent, List, ListItem, ListItemText,
  Divider, CircularProgress, useTheme, alpha,
  IconButton, Collapse, Tooltip, Alert, Grid,
  InputAdornment, Menu, MenuItem, LinearProgress
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchemaIcon from '@mui/icons-material/Schema';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';
import ShareIcon from '@mui/icons-material/Share';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SpeedIcon from '@mui/icons-material/Speed';
import ScaleIcon from '@mui/icons-material/Scale';
// Mock semantic search service
// In a real implementation, this would connect to a vector database
const semanticSearchService = {
  getSimilarRegulations: async (query, filters = {}) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate semantic search results
    // In a real implementation, this would use embeddings to find similar regulations
    const mockResults = [
      {
        id: 'reg-1',
        title: 'Environmental Protection Standards for Industrial Discharges',
        agency: 'Environmental Protection Agency',
        citation: '40 CFR 122.44',
        date: '2023-06-15',
        snippet: 'This regulation establishes effluent limitations for industrial discharges into waters of the United States. Requirements include monitoring, reporting, and implementation of best management practices to minimize environmental impact.',
        similarity: 0.92,
        keywords: ['environmental', 'water quality', 'discharge', 'monitoring'],
        intent: 'regulatory compliance',
        url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-122/subpart-C/section-122.44'
      },
      {
        id: 'reg-2',
        title: 'Clean Water Act Implementation Procedures',
        agency: 'Environmental Protection Agency',
        citation: '40 CFR 131.12',
        date: '2022-11-08',
        snippet: 'The antidegradation policy and implementation methods shall, at a minimum, be consistent with the following: Existing instream water uses and the level of water quality necessary to protect the existing uses shall be maintained and protected.',
        similarity: 0.87,
        keywords: ['water quality', 'protection', 'standards', 'policy'],
        intent: 'environmental protection',
        url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-131/subpart-B/section-131.12'
      },
      {
        id: 'reg-3',
        title: 'Occupational Safety Standards for Hazardous Materials',
        agency: 'Occupational Safety and Health Administration',
        citation: '29 CFR 1910.120',
        date: '2021-09-20',
        snippet: 'Employers shall develop and implement a written safety and health program for their employees involved in hazardous waste operations. The program shall incorporate the following: organizational structure, comprehensive workplan, site-specific safety and health plan.',
        similarity: 0.78,
        keywords: ['safety', 'hazardous materials', 'health program', 'employers'],
        intent: 'worker protection',
        url: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-H/section-1910.120'
      },
      {
        id: 'reg-4',
        title: 'Financial Responsibility Requirements for Hazardous Waste Facilities',
        agency: 'Environmental Protection Agency',
        citation: '40 CFR 264.147',
        date: '2023-01-30',
        snippet: 'An owner or operator of a hazardous waste treatment, storage, or disposal facility must demonstrate financial responsibility for bodily injury and property damage to third parties caused by sudden accidental occurrences arising from operations of the facility.',
        similarity: 0.74,
        keywords: ['financial responsibility', 'hazardous waste', 'liability', 'insurance'],
        intent: 'financial compliance',
        url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-I/part-264/subpart-H/section-264.147'
      },
      {
        id: 'reg-5',
        title: 'Reporting Requirements for Hazardous Substance Releases',
        agency: 'Environmental Protection Agency',
        citation: '40 CFR 302.6',
        date: '2022-07-12',
        snippet: 'Any person in charge of a vessel or an offshore or an onshore facility shall, as soon as they have knowledge of any release of a hazardous substance from such vessel or facility in quantities equal to or exceeding reportable quantities, immediately notify the National Response Center.',
        similarity: 0.72,
        keywords: ['reporting', 'hazardous substance', 'release', 'notification'],
        intent: 'emergency response',
        url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-J/part-302/section-302.6'
      },
      {
        id: 'reg-6',
        title: 'Water Quality Standards for Surface Waters',
        agency: 'Environmental Protection Agency',
        citation: '40 CFR 131.10',
        date: '2023-03-15',
        snippet: 'The State shall specify appropriate water uses to be achieved and protected. The classification of the waters of the State must take into consideration the use and value of water for public water supplies, protection of fish, wildlife, and recreational purposes.',
        similarity: 0.68,
        keywords: ['water quality', 'standards', 'classification', 'protection'],
        intent: 'environmental standards',
        url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-131/subpart-B/section-131.10'
      }
    ];
    
    // Apply filters if any
    let filteredResults = [...mockResults];
    
    if (filters.agency) {
      filteredResults = filteredResults.filter(result => 
        result.agency.toLowerCase().includes(filters.agency.toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredResults = filteredResults.filter(result => 
        new Date(result.date) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredResults = filteredResults.filter(result => 
        new Date(result.date) <= toDate
      );
    }
    
    // Add query to search history
    // In a real implementation, this would be stored in a database
    const searchHistory = localStorage.getItem('searchHistory');
    const parsedHistory = searchHistory ? JSON.parse(searchHistory) : [];
    const newHistory = [
      { query, timestamp: new Date().toISOString() },
      ...parsedHistory.filter(item => item.query !== query)
    ].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    return {
      results: filteredResults,
      query: {
        original: query,
        expanded: `${query} environmental protection water quality standards`,
        intent: 'Find regulatory compliance requirements for environmental protection',
        entities: ['environmental protection', 'water quality', 'standards', 'compliance']
      },
      metadata: {
        totalResults: filteredResults.length,
        processingTime: Math.random() * 0.5 + 0.5, // 0.5-1.0 seconds
        relevanceScore: 0.85,
        topAgencies: ['Environmental Protection Agency', 'Occupational Safety and Health Administration'],
        semanticModel: 'regulatory-bert-v2',
        queryExpansion: true
      }
    };
  },
  
  getQuerySuggestions: async (query) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate query suggestions based on input
    const suggestions = [
      `${query} requirements`,
      `${query} standards`,
      `${query} compliance`,
      `${query} regulations`,
      `${query} reporting`
    ];
    
    return suggestions;
  },
  
  getSearchInsights: async (query, results) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate insights from search results
    return {
      topTopics: [
        { name: 'Environmental Protection', weight: 0.35 },
        { name: 'Regulatory Compliance', weight: 0.25 },
        { name: 'Reporting Requirements', weight: 0.20 },
        { name: 'Safety Standards', weight: 0.15 },
        { name: 'Financial Responsibility', weight: 0.05 }
      ],
      keyInsights: [
        'Most regulations require some form of monitoring and reporting',
        'Environmental regulations emphasize both prevention and response protocols',
        'Financial responsibility is a common compliance requirement',
        'Safety standards often reference specific technical benchmarks'
      ],
      relatedConcepts: [
        { name: 'monitoring', score: 0.88 },
        { name: 'reporting', score: 0.85 },
        { name: 'compliance', score: 0.82 },
        { name: 'standards', score: 0.78 },
        { name: 'notification', score: 0.75 }
      ],
      regulatoryTrends: {
        increasing: ['reporting requirements', 'digital compliance', 'public disclosure'],
        decreasing: ['paper documentation', 'extended timelines']
      }
    };
  }
};

// Search result component
const SearchResultCard = ({ result, expanded, onToggleExpand, onBookmark }) => {
  const theme = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(result, !isBookmarked);
    }
  };
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const highlightText = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return text;
    
    let highlightedText = text;
    keywords.forEach(keyword => {
      if (!keyword) return;
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, match => 
        `<mark style="background-color:${alpha(theme.palette.primary.main, 0.15)};color:inherit;padding:0 2px;border-radius:2px;">${match}</mark>`
      );
    });
    
    return highlightedText;
  };
  
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3)
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ pr: 6 }}
            dangerouslySetInnerHTML={{ 
              __html: highlightText(result.title, result.keywords) 
            }}
          />
          
          <Box sx={{ display: 'flex' }}>
            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Bookmark"}>
              <IconButton 
                size="small" 
                onClick={handleBookmarkClick}
                sx={{ color: isBookmarked ? 'primary.main' : 'text.secondary' }}
              >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
            
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                Share
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <SaveAltIcon fontSize="small" sx={{ mr: 1 }} />
                Download
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <LinkIcon fontSize="small" sx={{ mr: 1 }} />
                Copy Link
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <BusinessIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
          {result.agency} · 
          <Box component="span" sx={{ ml: 1 }}>
            <FormatQuoteIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
            {result.citation}
          </Box> ·
          <Box component="span" sx={{ ml: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
            {new Date(result.date).toLocaleDateString()}
          </Box>
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="body1" 
            paragraph
            dangerouslySetInnerHTML={{ 
              __html: highlightText(result.snippet, result.keywords) 
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {result.keywords.map((keyword, index) => (
            <Chip 
              key={index}
              label={keyword}
              size="small"
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            />
          ))}
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <PsychologyIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Intent Analysis
                </Typography>
                <Typography variant="body2">
                  This regulation primarily addresses <strong>{result.intent}</strong>.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <SpeedIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                  Relevance Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {Math.round(result.similarity * 100)}% Match
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={result.similarity * 100}
                    sx={{ 
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  startIcon={<LinkIcon />}
                  component="a"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                >
                  View Complete Regulation
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button 
            size="small" 
            onClick={onToggleExpand}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Search insights component
const SearchInsightsPanel = ({ insights, isLoading }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Analyzing search results...
        </Typography>
      </Box>
    );
  }
  
  if (!insights) {
    return null;
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <InsightsIcon sx={{ mr: 1 }} />
        Search Insights
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Key Insights
              </Typography>
              <List dense disablePadding>
                {insights.keyInsights.map((insight, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AutoFixHighIcon 
                            color="primary" 
                            fontSize="small" 
                            sx={{ mr: 1, opacity: 0.7 }} 
                          />
                          {insight}
                        </Typography>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Related Concepts
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {insights.relatedConcepts.map((concept, index) => (
                  <Chip 
                    key={index}
                    label={concept.name}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, concept.score / 10),
                      color: concept.score > 0.8 
                        ? theme.palette.primary.contrastText 
                        : theme.palette.text.primary
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Regulatory Trends
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                Increasing Focus:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {insights.regulatoryTrends.increasing.map((trend, index) => (
                  <Chip 
                    key={index}
                    label={trend}
                    size="small"
                    sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1) }}
                  />
                ))}
              </Box>
              
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                Decreasing Focus:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {insights.regulatoryTrends.decreasing.map((trend, index) => (
                  <Chip 
                    key={index}
                    label={trend}
                    size="small"
                    sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Filter panel component
const FilterPanel = ({ filters, onFilterChange, onApplyFilters, agencies = [] }) => {
  const [localFilters, setLocalFilters] = useState({ ...filters });
  
  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      agency: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance'
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter Results
          </Typography>
          <Button size="small" onClick={handleReset}>
            Reset
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Agency
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={localFilters.agency}
            onChange={(e) => handleFilterChange('agency', e.target.value)}
          >
            <MenuItem value="">All Agencies</MenuItem>
            {agencies.map((agency) => (
              <MenuItem key={agency} value={agency}>
                {agency}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Date Range
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="From"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={localFilters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="To"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={localFilters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sort By
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="date-desc">Newest First</MenuItem>
            <MenuItem value="date-asc">Oldest First</MenuItem>
          </TextField>
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

// Semantic Search Component
const SemanticSearchEngine = () => {
  const theme = useTheme();
  const searchInputRef = useRef(null);
  
  // State for search functionality
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [expandedResults, setExpandedResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    agency: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // State for query suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // State for search history
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);
  
  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };
  
  // Handle historical search selection
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    handleSearch(historyItem.query);
  };
  
  // Get query suggestions as user types
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const getSuggestions = async () => {
      try {
        const results = await semanticSearchService.getQuerySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting query suggestions:', error);
      }
    };
    
    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  // Handle search submission
  const handleSearch = async (customQuery = null) => {
    const searchQuery = customQuery || query;
    if (!searchQuery) return;
    
    try {
      setIsSearching(true);
      setSearchError(null);
      setShowSuggestions(false);
      
      const results = await semanticSearchService.getSimilarRegulations(searchQuery, filters);
      setSearchResults(results);
      
      // Reset expanded state for new results
      const newExpandedState = {};
      results.results.forEach(result => {
        newExpandedState[result.id] = false;
      });
      setExpandedResults(newExpandedState);
      
      // Load insights for the search
      if (results.results.length > 0) {
        loadInsightsForSearch(searchQuery, results.results);
      }
      
      // Update search history
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Error updating search history:', error);
        }
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  // Load insights for search results
  const loadInsightsForSearch = async (searchQuery, results) => {
    try {
      setIsLoadingInsights(true);
      const insightsData = await semanticSearchService.getSearchInsights(searchQuery, results);
      setInsights(insightsData);
      setShowInsights(true);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };
  
  // Handle toggle expand/collapse for a result
  const handleToggleExpand = (resultId) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };
  
  // Handle bookmark toggling
  const handleBookmark = (result, isBookmarked) => {
    // In a real app, this would save to a database or localStorage
    console.log(`${isBookmarked ? 'Bookmarked' : 'Unbookmarked'} result:`, result.id);
  };
  
  // Handle filter toggle
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle filter changes
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Re-run the search with new filters
    if (searchResults) {
      handleSearch();
    }
  };
  
  // Get unique agencies from results for filter dropdown
  const uniqueAgencies = useMemo(() => {
    if (!searchResults || !searchResults.results) return [];
    return [...new Set(searchResults.results.map(result => result.agency))];
  }, [searchResults]);
  
  // Sort results based on filter settings
  const sortedResults = useMemo(() => {
    if (!searchResults || !searchResults.results) return [];
    
    const results = [...searchResults.results];
    
    switch (filters.sortBy) {
      case 'date-desc':
        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'date-asc':
        return results.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'relevance':
      default:
        return results.sort((a, b) => b.similarity - a.similarity);
    }
  }, [searchResults, filters.sortBy]);
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <SchemaIcon sx={{ mr: 1, verticalAlign: 'top' }} />
        Semantic Regulation Search
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Our advanced AI-powered search uses semantic embeddings to understand regulatory intent and find the most relevant regulations.
      </Typography>
      
      {/* Search Box */}
      <Box sx={{ mb: 4, position: 'relative' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for regulations by topic, entity, or concept..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={searchInputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {query && (
                  <IconButton 
                    edge="end" 
                    onClick={() => setQuery('')}
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: { 
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
              pr: 1
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
                borderWidth: 2
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            }
          }}
        />
        
        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              width: '100%',
              zIndex: 10,
              mt: 0.5,
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <List disablePadding>
              {suggestions.map((suggestion, index) => (
                <ListItem 
                  button 
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <ListItemText 
                    primary={suggestion} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      style: { fontWeight: 500 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        
        {/* Search History */}
        {!query && searchHistory.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HistoryIcon fontSize="small" sx={{ mr: 0.5 }} />
              Recent Searches:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchHistory.map((item, index) => (
                <Chip
                  key={index}
                  label={item.query}
                  size="small"
                  clickable
                  onClick={() => handleHistoryClick(item)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Search Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSearch()}
          startIcon={isSearching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          disabled={isSearching || !query}
          sx={{ 
            px: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            boxShadow: `0 3px 5px 2px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          {isSearching ? 'Searching...' : 'Search Regulations'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleToggleFilters}
          startIcon={<TuneIcon />}
          sx={{ 
            borderColor: showFilters ? theme.palette.primary.main : undefined,
            backgroundColor: showFilters ? alpha(theme.palette.primary.main, 0.1) : undefined
          }}
        >
          Filter & Sort
        </Button>
      </Box>
      
      {/* Search Error */}
      {searchError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
        >
          {searchError}
        </Alert>
      )}
      
      {/* Search Results */}
      {searchResults && (
        <Grid container spacing={3}>
          {/* Main Results Column */}
          <Grid item xs={12} md={showFilters ? 8 : 12}>
            {/* Search Metadata */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6">
                  {searchResults.results.length} Results for "{query}"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search completed in {searchResults.metadata.processingTime.toFixed(2)}s
                </Typography>
              </Box>
              
              {searchResults.query.expanded !== query && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                    '& .MuiAlert-icon': {
                      color: theme.palette.info.main
                    }
                  }}
                >
                  <Typography variant="body2">
                    <strong>AI-Enhanced Search:</strong> We expanded your query to "{searchResults.query.expanded}" to improve results.
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon 
                    color="primary" 
                    fontSize="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Intent:</strong> {searchResults.query.intent}
                  </Typography>
                </Box>
                
                <Button
                  size="small"
                  startIcon={<InsightsIcon />}
                  variant="text"
                  onClick={() => setShowInsights(!showInsights)}
                >
                  {showInsights ? 'Hide Insights' : 'Show Insights'}
                </Button>
              </Box>
            </Box>
            
            {/* Insights Panel */}
            <Collapse in={showInsights}>
              <Box sx={{ mb: 3 }}>
                <SearchInsightsPanel 
                  insights={insights} 
                  isLoading={isLoadingInsights} 
                />
              </Box>
            </Collapse>
            
            {/* Results List */}
            {sortedResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                expanded={expandedResults[result.id]}
                onToggleExpand={() => handleToggleExpand(result.id)}
                onBookmark={handleBookmark}
              />
            ))}
            
            {/* No Results State */}
            {sortedResults.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <ErrorOutlineIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No regulations found
                </Typography>
                <Typography color="text.secondary">
                  Try different keywords or adjust your filters.
                </Typography>
              </Box>
            )}
          </Grid>
          
          {/* Filters Column */}
          {showFilters && (
            <Grid item xs={12} md={4}>
              <FilterPanel 
                filters={filters}
                onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                onApplyFilters={handleApplyFilters}
                agencies={uniqueAgencies}
              />
              
              {searchResults.results.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Card variant="outlined" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScaleIcon sx={{ mr: 1 }} />
                        Relevance Metrics
                      </Typography>
                      
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Average Relevance Score" 
                            secondary={`${Math.round(searchResults.metadata.relevanceScore * 100)}%`} 
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Most Relevant Agencies" 
                            secondary={searchResults.metadata.topAgencies.join(', ')} 
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText 
                            primary="Semantic Model" 
                            secondary={searchResults.metadata.semanticModel} 
                          />
                        </ListItem>
                      </List>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Identified Entities:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {searchResults.query.entities.map((entity, index) => (
                          <Chip 
                            key={index}
                            label={entity}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Initial State */}
      {!searchResults && !isSearching && !searchError && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <SchemaIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            AI-Powered Semantic Search
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            Our advanced machine learning algorithms understand the meaning behind regulations, not just keywords. Search for concepts, topics, or requirements to find relevant regulations.
          </Typography>
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Try searching for:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              {['environmental protection', 'data privacy requirements', 'workplace safety standards', 'financial reporting', 'emissions limits'].map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  clickable
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  sx={{ 
                    my: 0.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default SemanticSearchEngine;
