
// RegulationExplorer.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Autocomplete,
  Card, CardContent, Chip, Button, IconButton,
  Tooltip, useTheme, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, useMediaQuery, Divider, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
// Import axios for real API calls
import axios from 'axios';

// API base URL from your original code
const API_BASE_URL = 'https://ecfr-analyzer-production-ef73.up.railway.app/api';

/**
 * Improved RegulationExplorer component that integrates with your existing API
 */
const RegulationExplorer = ({ agenciesData = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Core states
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [agencies, setAgencies] = useState(agenciesData || []);
  const [titles, setTitles] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [versions, setVersions] = useState(null);
  const [titleStructure, setTitleStructure] = useState(null);
  const [selectedStructureNode, setSelectedStructureNode] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState({
    agency_slugs: [],
    date: '',
    per_page: 10,
    page: 1
  });
  
  // Corrections filters
  const [correctionsFilter, setCorrectionsFilter] = useState({
    title: '',
    date: '',
    error_corrected_date: ''
  });

  // Version params
  const [versionParams, setVersionParams] = useState({
    issue_date: {
      gte: '2020-01-01',
      lte: new Date().toISOString().split('T')[0]
    }
  });

  // Current date for API calls
  const currentDate = new Date().toISOString().split('T')[0];

  // Load agencies on mount if not provided
  useEffect(() => {
    if (agencies.length === 0) {
      fetchAgencies();
    }
    
    // Also load titles on mount
    fetchTitles();
  }, [agencies.length]);

  // Load corrections when filter changes
  useEffect(() => {
    if (activeTab === 3) {
      fetchCorrections(correctionsFilter);
    }
  }, [activeTab, correctionsFilter]);

  // Real API integration functions
  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/agencies`);
      setAgencies(response.data.agencies || []);
    } catch (err) {
      setError('Failed to load agencies: ' + (err.message || 'Unknown error'));
      console.error("Error fetching agencies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTitles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/titles`);
      setTitles(response.data.titles || []);
    } catch (err) {
      setError('Failed to load titles: ' + (err.message || 'Unknown error'));
      console.error("Error fetching titles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRegulations = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await searchRegulationsAPI(searchQuery, searchParams);
      setSearchResults(data);
    } catch (err) {
      setError('Search failed: ' + (err.message || 'Unknown error'));
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRegulationsAPI = async (query, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', query);
      
      if (params.date) queryParams.append('date', params.date);
      if (params.agency_slugs && params.agency_slugs.length) {
        params.agency_slugs.forEach(slug => queryParams.append('agency_slugs[]', slug));
      }
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);
      
      const url = `${API_BASE_URL}/search?${queryParams.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error searching regulations:', error);
      throw error;
    }
  };

  const fetchTitleStructure = async (title) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/structure/${currentDate}/title-${title.number}`;
      const response = await axios.get(url);
      setTitleStructure(response.data);
    } catch (err) {
      setError(`Error fetching structure for title ${title.number}: ${err.message || 'Unknown error'}`);
      setTitleStructure(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVersions = async (title) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare version parameters
      const queryParams = new URLSearchParams();
      
      // Handle issue date filters
      if (versionParams.issue_date) {
        if (versionParams.issue_date.gte) 
          queryParams.append('issue_date[gte]', versionParams.issue_date.gte);
        if (versionParams.issue_date.lte) 
          queryParams.append('issue_date[lte]', versionParams.issue_date.lte);
      }
      
      const url = `${API_BASE_URL}/versions/title-${title.number}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await axios.get(url);
      setVersions(response.data);
    } catch (err) {
      setError(`Error fetching versions for title ${title.number}: ${err.message || 'Unknown error'}`);
      setVersions(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCorrections = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.title) queryParams.append('title', params.title);
      if (params.error_corrected_date) queryParams.append('error_corrected_date', params.error_corrected_date);
      
      const url = `${API_BASE_URL}/corrections${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await axios.get(url);
      setCorrections(response.data.ecfr_corrections || []);
    } catch (err) {
      setError('Failed to load corrections: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load data for specific tabs when they become active
    if (newValue === 3) { // Corrections tab
      fetchCorrections(correctionsFilter);
    }
  };

  // Handle title selection
  const handleTitleSelect = (title) => {
    setSelectedTitle(title);
    
    // Load title structure and versions
    fetchTitleStructure(title);
    fetchVersions(title);
  };

  // Handle structure node click
  const handleStructureNodeClick = (node) => {
    setSelectedStructureNode(node);
  };

  // Handle corrections filter change
  const handleCorrectionsFilterChange = (field, value) => {
    setCorrectionsFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render title structure tree
  const renderTitleStructureNode = (node) => {
    if (!node) return null;
    
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <Box key={node.identifier}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1, 
            cursor: 'pointer',
            '&:hover': {
              bgcolor: theme.palette.primary.main + '10'
            }
          }}
          onClick={() => handleStructureNodeClick(node)}
        >
          <Typography variant="body2">
            {node.label_level}: {node.label_description}
          </Typography>
        </Box>
        
        {hasChildren && (
          <Box sx={{ ml: 2, borderLeft: `1px dashed ${theme.palette.text.primary}20`, pl: 1 }}>
            {node.children.map(childNode => renderTitleStructureNode(childNode))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
      }}
      elevation={3}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Federal Regulation Explorer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Search and analyze federal regulations with our advanced exploration tools.
      </Typography>
      
      {/* Tabs for different sections */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile}
          allowScrollButtonsMobile
        >
          <Tab 
            label="Agency Analysis" 
            icon={<BusinessIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Title Structure" 
            icon={<AccountTreeIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Version History" 
            icon={<HistoryIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Corrections" 
            icon={<WarningIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Search" 
            icon={<SearchIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
      
      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Agency Analysis Tab */}
      {activeTab === 0 && (
        <Box>
          {selectedAgency ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Button 
                  startIcon={<ArrowBackIcon />} 
                  onClick={() => setSelectedAgency(null)}
                  sx={{ mb: 2 }}
                >
                  Back to Agencies
                </Button>
                
                <Typography variant="h5" gutterBottom>
                  {selectedAgency.name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Agency ID</Typography>
                        <Typography variant="h6">{selectedAgency.slug || selectedAgency.shortName || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Total CFR Parts</Typography>
                        <Typography variant="h6">{selectedAgency.total_parts || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Last Updated</Typography>
                        <Typography variant="h6">
                          {selectedAgency.updated_at 
                            ? new Date(selectedAgency.updated_at).toLocaleDateString() 
                            : 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>Regulations</Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SearchIcon />}
                  onClick={() => {
                    setSearchParams(prev => ({
                      ...prev,
                      agency_slugs: [selectedAgency.slug]
                    }));
                    setActiveTab(4);
                  }}
                >
                  Search {selectedAgency.shortName || selectedAgency.name} Regulations
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Select an Agency
                </Typography>
                <Autocomplete
                  options={agencies}
                  getOptionLabel={(option) => option.name || ''}
                  loading={isLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Agency"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, newValue) => {
                    setSelectedAgency(newValue);
                  }}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Agencies List
                </Typography>
                
                <Grid container spacing={2}>
                  {agencies.slice(0, 12).map((agency) => (
                    <Grid item xs={12} sm={6} md={4} key={agency.id || agency.slug}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 3, 
                            borderColor: theme.palette.primary.main 
                          },
                          height: '100%'
                        }}
                        onClick={() => setSelectedAgency(agency)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {agency.name}
                          </Typography>
                          
                          {agency.shortName && (
                            <Chip 
                              label={agency.shortName} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                              sx={{ mb: 1 }}
                            />
                          )}
                          
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="View Agency Details">
                              <IconButton size="small" color="primary">
                                <ZoomInIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                {agencies.length > 12 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button color="primary">
                      View All Agencies
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      )}
      
      {/* Title Structure Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Select a Title
            </Typography>
            <Autocomplete
              options={titles}
              getOptionLabel={(option) => `Title ${option.number} - ${option.name}`}
              loading={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Title"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              onChange={(event, newValue) => {
                if (newValue) handleTitleSelect(newValue);
              }}
              fullWidth
              sx={{ mb: 3 }}
            />
            
            {selectedTitle && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6">
                        Title {selectedTitle.number} - {selectedTitle.name}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Last Amended:</Typography>
                      <Typography variant="body1">
                        {selectedTitle.latest_amended_on ? new Date(selectedTitle.latest_amended_on).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Latest Issue:</Typography>
                      <Typography variant="body1">
                        {selectedTitle.latest_issue_date ? new Date(selectedTitle.latest_issue_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Up To Date As Of:</Typography>
                      <Typography variant="body1">
                        {selectedTitle.up_to_date_as_of ? new Date(selectedTitle.up_to_date_as_of).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    
                    {selectedTitle.reserved && (
                      <Grid item xs={12}>
                        <Chip 
                          label="Reserved" 
                          color="warning" 
                          variant="outlined" 
                          size="small" 
                        />
                      </Grid>
                    )}
                    
                    {selectedTitle.processing_in_progress && (
                      <Grid item xs={12}>
                        <Chip 
                          icon={<RefreshIcon />}
                          label="Processing in Progress" 
                          color="info" 
                          variant="outlined" 
                          size="small" 
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            {selectedTitle && titleStructure && (
              <Paper sx={{ maxHeight: 600, overflow: 'auto', p: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Title Structure
                </Typography>
                {renderTitleStructureNode(titleStructure)}
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedStructureNode ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedStructureNode.label || 'Regulation Details'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {selectedStructureNode.label_description || selectedStructureNode.label || 'No description available'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {selectedStructureNode.section_range && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Section Range</Typography>
                          <Typography variant="body1">{selectedStructureNode.section_range}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {selectedStructureNode.type || 'Unknown'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">Identifier</Typography>
                        <Typography variant="body1">{selectedStructureNode.identifier || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              selectedTitle && (
                <Alert severity="info">
                  Select a node from the title structure tree to view details
                </Alert>
              )
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Version History Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Select a Title for Version History
              </Typography>
              <Autocomplete
                options={titles}
                getOptionLabel={(option) => `Title ${option.number} - ${option.name}`}
                loading={isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Title"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  if (newValue) handleTitleSelect(newValue);
                }}
                fullWidth
                sx={{ mb: 3 }}
              />
              
              {selectedTitle && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Version Date Range</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="From Date"
                          type="date"
                          value={versionParams.issue_date.gte}
                          onChange={(e) => {
                            setVersionParams(prev => ({
                              ...prev,
                              issue_date: {
                                ...prev.issue_date,
                                gte: e.target.value
                              }
                            }));
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="To Date"
                          type="date"
                          value={versionParams.issue_date.lte}
                          onChange={(e) => {
                            setVersionParams(prev => ({
                              ...prev,
                              issue_date: {
                                ...prev.issue_date,
                                lte: e.target.value
                              }
                            }));
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button 
                          variant="contained" 
                          onClick={() => fetchVersions(selectedTitle)}
                          startIcon={<RefreshIcon />}
                          fullWidth
                        >
                          Reload Versions
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
            
            <Grid item xs={12}>
              {selectedTitle && versions && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Regulation Version Analysis for Title {selectedTitle.number}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {versions.content_versions?.length 
                      ? `Found ${versions.content_versions.length} version(s) for Title ${selectedTitle.number}.` 
                      : `No versions found for the selected date range for Title ${selectedTitle.number}.`}
                  </Alert>
                  
                  {versions.content_versions && versions.content_versions.length > 0 && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Identifier</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell align="center">Issue Date</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {versions.content_versions.map((version) => (
                            <TableRow key={version.identifier || version.id}>
                              <TableCell>{version.identifier}</TableCell>
                              <TableCell>{version.name}</TableCell>
                              <TableCell align="center">
                                {version.issue_date ? new Date(version.issue_date).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  startIcon={<ZoomInIcon />} 
                                  size="small" 
                                  color="primary"
                                >
                                  View
                                </Button>
                                <Button 
                                  startIcon={<CompareArrowsIcon />} 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                >
                                  Compare
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Corrections Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Regulation Corrections
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Title"
                value={correctionsFilter.title}
                onChange={(e) => handleCorrectionsFilterChange('title', e.target.value)}
                fullWidth
              >
                <MenuItem value="">All Titles</MenuItem>
                {titles.map((title) => (
                  <MenuItem key={title.number} value={title.number}>
                    Title {title.number}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Date (YYYY-MM-DD)"
                value={correctionsFilter.date}
                onChange={(e) => handleCorrectionsFilterChange('date', e.target.value)}
                fullWidth
                placeholder="e.g. 2023-01-01"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Corrected On Date (YYYY-MM-DD)"
                value={correctionsFilter.error_corrected_date}
                onChange={(e) => handleCorrectionsFilterChange('error_corrected_date', e.target.value)}
                fullWidth
                placeholder="e.g. 2023-01-01"
              />
            </Grid>
          </Grid>
          
          {/* Corrections List */}
          {corrections.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Found {corrections.length} corrections
              </Typography>
              
              {corrections.map((correction, index) => (
                <Card key={correction.id || index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {correction.cfr_references && correction.cfr_references.length > 0 
                        ? correction.cfr_references[0].cfr_reference
                        : `Correction ${correction.id}`}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {correction.corrective_action || 'Not specified'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Error Occurred:</Typography>
                        <Typography variant="body2">
                          {correction.error_occurred 
                            ? new Date(correction.error_occurred).toLocaleDateString() 
                            : 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>Error Corrected:</Typography>
                        <Typography variant="body2">
                          {correction.error_corrected 
                            ? new Date(correction.error_corrected).toLocaleDateString() 
                            : 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      {correction.fr_citation && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>FR Citation:</Typography>
                          <Typography variant="body2">{correction.fr_citation}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : !isLoading && (
            <Alert severity="info">
              No corrections found matching your criteria
            </Alert>
          )}
        </Box>
      )}
      
      {/* Search Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Search Federal Regulations
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                label="Search Query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Enter keywords to search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchRegulations();
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                options={agencies}
                getOptionLabel={(option) => option.name || ''}
                value={agencies.filter(agency => 
                  searchParams.agency_slugs.includes(agency.slug)
                )}
                onChange={(event, newValue) => {
                  setSearchParams(prev => ({
                    ...prev,
                    agency_slugs: newValue.map(agency => agency.slug)
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Agency"
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Date (YYYY-MM-DD)"
                value={searchParams.date}
                onChange={(e) => {
                  setSearchParams(prev => ({
                    ...prev,
                    date: e.target.value
                  }));
                }}
                fullWidth
                placeholder="e.g. 2023-01-01"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Results Per Page"
                value={searchParams.per_page}
                onChange={(e) => {
                  setSearchParams(prev => ({
                    ...prev,
                    per_page: e.target.value
                  }));
                }}
                fullWidth
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={searchRegulations}
                disabled={!searchQuery.trim() || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ py: 1 }}
              >
                {isLoading ? 'Searching...' : 'Search Regulations'}
              </Button>
            </Grid>
          </Grid>
          
          {/* Search Results */}
          {searchResults && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results
              </Typography>
              
              {searchResults.results && searchResults.results.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Found {searchResults.meta?.total_count || searchResults.results.length} result(s). 
                    Showing page {searchResults.meta?.current_page || 1} of {searchResults.meta?.total_pages || 1}.
                  </Typography>
                  
                  {searchResults.results.map((result, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {result.title || 'Untitled Regulation'}
                        </Typography>
                        
                        {result.citation && (
                          <Typography variant="body2" color="text.secondary">
                            {result.citation}
                          </Typography>
                        )}
                        
                        {result.snippet && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {result.snippet}...
                          </Typography>
                        )}
                        
                        {result.url && (
                          <Button 
                            variant="text" 
                            size="small" 
                            startIcon={<SearchIcon />}
                            component="a"
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 1 }}
                          >
                            View Full Regulation
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Pagination */}
                  {searchResults.meta?.total_pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        disabled={searchResults.meta.current_page <= 1 || isLoading}
                        onClick={() => {
                          setSearchParams(prev => ({
                            ...prev,
                            page: prev.page - 1
                          }));
                          searchRegulations();
                        }}
                      >
                        Previous
                      </Button>
                      
                      <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Page {searchResults.meta.current_page} of {searchResults.meta.total_pages}
                      </Typography>
                      
                      <Button
                        disabled={searchResults.meta.current_page >= searchResults.meta.total_pages || isLoading}
                        onClick={() => {
                          setSearchParams(prev => ({
                            ...prev,
                            page: prev.page + 1
                          }));
                          searchRegulations();
                        }}
                      >
                        Next
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  No results found for "{searchQuery}". Try different keywords or filters.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default RegulationExplorer;