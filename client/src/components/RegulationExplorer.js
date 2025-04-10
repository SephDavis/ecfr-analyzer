// components/RegulationExplorer.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Autocomplete,
  Card, CardContent, Divider, Chip, Button, IconButton,
  Tooltip, LinearProgress, alpha, useTheme, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Collapse, CircularProgress, Alert, InputAdornment, MenuItem, Select,
  FormControl, InputLabel, Switch, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Stepper, Step, StepLabel,
  useMediaQuery, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareIcon from '@mui/icons-material/Compare';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ScienceIcon from '@mui/icons-material/Science';
import DownloadIcon from '@mui/icons-material/Download';
import FunctionsIcon from '@mui/icons-material/Functions';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

// Import axios for API calls
import axios from 'axios';

// Import chart components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart,
  Scatter, ScatterChart, ZAxis, Treemap, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// API base URL - use proxy server instead of direct eCFR API
const API_BASE_URL = 'https://ecfr-analyzer-production-ef73.up.railway.app/api';

// Utility functions for API calls
const fetchAgencies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/agencies`);
    return response.data.agencies || [];
  } catch (error) {
    console.error('Error fetching agencies:', error);
    throw error;
  }
};

const fetchTitles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/titles`);
    return response.data.titles || [];
  } catch (error) {
    console.error('Error fetching titles:', error);
    throw error;
  }
};

const fetchCorrections = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.title) queryParams.append('title', params.title);
    if (params.error_corrected_date) queryParams.append('error_corrected_date', params.error_corrected_date);
    
    const url = `${API_BASE_URL}/corrections${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data.ecfr_corrections || [];
  } catch (error) {
    console.error('Error fetching corrections:', error);
    throw error;
  }
};

const searchRegulations = async (query, params = {}) => {
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

const fetchTitleStructure = async (date, title) => {
  try {
    const url = `${API_BASE_URL}/structure/${date}/title-${title}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching structure for title ${title}:`, error);
    throw error;
  }
};

const fetchAncestry = async (date, title, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.subtitle) queryParams.append('subtitle', params.subtitle);
    if (params.chapter) queryParams.append('chapter', params.chapter);
    if (params.subchapter) queryParams.append('subchapter', params.subchapter);
    if (params.part) queryParams.append('part', params.part);
    if (params.subpart) queryParams.append('subpart', params.subpart);
    if (params.section) queryParams.append('section', params.section);
    if (params.appendix) queryParams.append('appendix', params.appendix);
    
    const url = `${API_BASE_URL}/ancestry/${date}/title-${title}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching ancestry:', error);
    throw error;
  }
};

const fetchVersions = async (title, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Handle issue date filters
    if (params.issue_date) {
      if (params.issue_date.on) queryParams.append('issue_date[on]', params.issue_date.on);
      if (params.issue_date.lte) queryParams.append('issue_date[lte]', params.issue_date.lte);
      if (params.issue_date.gte) queryParams.append('issue_date[gte]', params.issue_date.gte);
    }
    
    // Handle hierarchy filters
    if (params.subtitle) queryParams.append('subtitle', params.subtitle);
    if (params.chapter) queryParams.append('chapter', params.chapter);
    if (params.subchapter) queryParams.append('subchapter', params.subchapter);
    if (params.part) queryParams.append('part', params.part);
    if (params.subpart) queryParams.append('subpart', params.subpart);
    if (params.section) queryParams.append('section', params.section);
    if (params.appendix) queryParams.append('appendix', params.appendix);
    
    const url = `${API_BASE_URL}/versions/title-${title}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching versions for title ${title}:`, error);
    throw error;
  }
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: 1.5,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`tooltip-${index}`}
            variant="body2"
            sx={{ 
              color: entry.color || theme.palette.primary.main, 
              fontWeight: 600 
            }}
          >
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Component to display regulation details
const RegulationDetails = ({ loading, data, error }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Select a regulation to view details
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {data.label || 'Regulation Details'}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {data.label_description || data.label || 'No description available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {data.section_range && (
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">Section Range</Typography>
                <Typography variant="body1">{data.section_range}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {data.type || 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">Identifier</Typography>
              <Typography variant="body1">{data.identifier || 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Component to display an agency's detail
const AgencyDetail = ({ agency, onClose }) => {
  const theme = useTheme();
  
  if (!agency) return null;
  
  // Extract data for visualization
  const wordCountChartData = [
    { name: agency.name, value: agency.wordCount }
  ];
  
  return (
    <Card sx={{ 
      mb: 3, 
      position: 'relative',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
    }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {agency.name}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                icon={<BusinessIcon fontSize="small" />} 
                label={agency.shortName || 'Agency'} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                icon={<TextSnippetIcon fontSize="small" />} 
                label={`${agency.wordCount.toLocaleString()} words`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                icon={<FormatListNumberedIcon fontSize="small" />} 
                label={`${agency.regulationCount.toLocaleString()} regulations`} 
                sx={{ 
                  borderColor: theme.palette.chart[2], 
                  color: theme.palette.chart[2] 
                }} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wordCountChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill={theme.palette.primary.main}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill={theme.palette.primary.main} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Details</Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Agency ID:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{agency.agencyId}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Avg. Words per Regulation:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {Math.round(agency.wordCount / (agency.regulationCount || 1)).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {new Date(agency.lastUpdated).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ZoomInIcon />}
              fullWidth
            >
              View All Regulations
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Component to display corrections
const CorrectionsList = ({ corrections, loading, error }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!corrections || corrections.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No corrections found
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Corrections
      </Typography>
      
      {corrections.map((correction, index) => (
        <Accordion key={correction.id || index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">
              {correction.cfr_references && correction.cfr_references.length > 0 
                ? correction.cfr_references[0].cfr_reference
                : `Correction ${correction.id}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Corrective Action:</Typography>
                <Typography variant="body2">{correction.corrective_action || 'Not specified'}</Typography>
              </Grid>
              
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
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

// Component to display title structure in a tree view
const TitleStructureTree = ({ structure, loading, error, onNodeClick }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!structure) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No structure data available
      </Alert>
    );
  }
  
  const renderNode = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <Box key={node.identifier}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1, 
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
          onClick={() => onNodeClick(node)}
        >
          <Typography variant="body2">
            {node.label_level}: {node.label_description}
          </Typography>
        </Box>
        
        {hasChildren && (
          <Box sx={{ ml: 2, borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`, pl: 1 }}>
            {node.children.map(childNode => renderNode(childNode))}
          </Box>
        )}
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Title Structure
      </Typography>
      <Paper sx={{ maxHeight: 600, overflow: 'auto', p: 2 }}>
        {renderNode(structure)}
      </Paper>
    </Box>
  );
};

// Component to compare regulation versions
const RegulationVersionComparison = ({ title, versions, loading, error }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!versions || !versions.content_versions || versions.content_versions.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No version data available
      </Alert>
    );
  }
  
  // Group versions by identifier
  const groupedVersions = versions.content_versions.reduce((acc, version) => {
    if (!acc[version.identifier]) {
      acc[version.identifier] = [];
    }
    acc[version.identifier].push(version);
    return acc;
  }, {});
  
  // Create chart data for versions over time
  const chartData = Object.keys(groupedVersions).map(identifier => {
    const versionsList = groupedVersions[identifier];
    const latestVersion = versionsList[versionsList.length - 1];
    
    return {
      identifier,
      name: latestVersion.name,
      versionCount: versionsList.length,
      firstDate: new Date(versionsList[0].issue_date).toLocaleDateString(),
      lastDate: new Date(latestVersion.issue_date).toLocaleDateString(),
    };
  });
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Regulation Version Analysis for Title {title}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Summary</Typography>
              <Typography variant="body2">
                Found {versions.content_versions.length} version(s) across {Object.keys(groupedVersions).length} regulation(s).
                Versions range from {versions.meta?.issue_date?.gte ? new Date(versions.meta.issue_date.gte).toLocaleDateString() : 'unknown'} to {versions.meta?.issue_date?.lte ? new Date(versions.meta.issue_date.lte).toLocaleDateString() : 'unknown'}.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Identifier</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Version Count</TableCell>
                  <TableCell>First Version</TableCell>
                  <TableCell>Latest Version</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.identifier}>
                    <TableCell>{row.identifier}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="center">{row.versionCount}</TableCell>
                    <TableCell>{row.firstDate}</TableCell>
                    <TableCell>{row.lastDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="identifier" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="versionCount" 
                  name="Version Count" 
                  fill={theme.palette.primary.main} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main component for regulation explorer
const RegulationExplorer = ({ agenciesData = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for main UI
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for agencies
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agenciesList, setAgenciesList] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  
  // State for titles
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [loadingTitles, setLoadingTitles] = useState(false);
  
  // State for corrections
  const [corrections, setCorrections] = useState([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [correctionsFilter, setCorrectionsFilter] = useState({
    title: '',
    date: '',
    error_corrected_date: ''
  });
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    agency_slugs: [],
    date: '',
    per_page: 10,
    page: 1
  });
  
  // State for title structure
  const [titleStructure, setTitleStructure] = useState(null);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [selectedStructureNode, setSelectedStructureNode] = useState(null);
  
  // State for versions
  const [versions, setVersions] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionParams, setVersionParams] = useState({
    issue_date: {
      gte: '2020-01-01',
      lte: new Date().toISOString().split('T')[0]
    }
  });
  
  // Current date for API calls
  const currentDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);
  
  // Load agencies on mount
  useEffect(() => {
    const getAgencies = async () => {
      try {
        setLoadingAgencies(true);
        setError(null);
        
        // Use provided agencies data if available, otherwise fetch from API
        if (agenciesData && agenciesData.length > 0) {
          setAgenciesList(agenciesData);
        } else {
          const data = await fetchAgencies();
          setAgenciesList(data);
        }
      } catch (err) {
        setError('Failed to load agencies: ' + (err.message || 'Unknown error'));
      } finally {
        setLoadingAgencies(false);
      }
    };
    
    getAgencies();
  }, [agenciesData]);
  
  // Load titles on mount
  useEffect(() => {
    const getTitles = async () => {
      try {
        setLoadingTitles(true);
        setError(null);
        
        const data = await fetchTitles();
        setTitles(data);
      } catch (err) {
        setError('Failed to load titles: ' + (err.message || 'Unknown error'));
      } finally {
        setLoadingTitles(false);
      }
    };
    
    getTitles();
  }, []);
  
  // Load corrections when filter changes
  useEffect(() => {
    const getCorrections = async () => {
      try {
        setLoadingCorrections(true);
        setError(null);
        
        const data = await fetchCorrections(correctionsFilter);
        setCorrections(data);
      } catch (err) {
        setError('Failed to load corrections: ' + (err.message || 'Unknown error'));
      } finally {
        setLoadingCorrections(false);
      }
    };
    
    getCorrections();
  }, [correctionsFilter]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle agency selection
  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
  };
  
  // Clear selected agency
  const handleClearAgency = () => {
    setSelectedAgency(null);
  };
  
  // Handle title selection
  const handleTitleSelect = (title) => {
    setSelectedTitle(title);
    
    // Load title structure
    const getTitleStructure = async () => {
      try {
        setLoadingStructure(true);
        setError(null);
        
        const data = await fetchTitleStructure(currentDate, title.number);
        setTitleStructure(data);
      } catch (err) {
        setError('Failed to load title structure: ' + (err.message || 'Unknown error'));
        setTitleStructure(null);
      } finally {
        setLoadingStructure(false);
      }
    };
    
    // Load versions
    const getVersions = async () => {
      try {
        setLoadingVersions(true);
        setError(null);
        
        const data = await fetchVersions(title.number, versionParams);
        setVersions(data);
      } catch (err) {
        setError('Failed to load versions: ' + (err.message || 'Unknown error'));
        setVersions(null);
      } finally {
        setLoadingVersions(false);
      }
    };
    
    getTitleStructure();
    getVersions();
  };
  
  // Handle structure node click
  const handleStructureNodeClick = (node) => {
    setSelectedStructureNode(node);
  };
  
  // Handle search submit
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoadingSearch(true);
      setError(null);
      
      const data = await searchRegulations(searchQuery, searchParams);
      setSearchResults(data);
    } catch (err) {
      setError('Search failed: ' + (err.message || 'Unknown error'));
      setSearchResults(null);
    } finally {
      setLoadingSearch(false);
    }
  };
  
  // Handle corrections filter change
  const handleCorrectionsFilterChange = (field, value) => {
    setCorrectionsFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}
      elevation={3}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Advanced Regulation Explorer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Perform deep analysis of the Electronic Code of Federal Regulations (eCFR) with advanced data visualization and exploration tools.
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
      
      {/* Agency Analysis Tab */}
      {activeTab === 0 && (
        <Box>
          {selectedAgency ? (
            <AgencyDetail agency={selectedAgency} onClose={handleClearAgency} />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Select an Agency
                </Typography>
                <Autocomplete
                  options={agenciesList}
                  getOptionLabel={(option) => option.name || ''}
                  loading={loadingAgencies}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Agency"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingAgencies ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, newValue) => {
                    handleAgencySelect(newValue);
                  }}
                  fullWidth
                />
              </Grid>
              
              {/* Summary stats for all agencies */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Agencies Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      height: '100%', 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
                    }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Agencies
                        </Typography>
                        <Typography variant="h3">
                          {agenciesList.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      height: '100%', 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
                    }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Regulations
                        </Typography>
                        <Typography variant="h3">
                          {agenciesList.reduce((sum, agency) => sum + (agency.regulationCount || 0), 0).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      height: '100%', 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.chart[2], 0.05)} 0%, ${alpha(theme.palette.chart[2], 0.15)} 100%)`
                    }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Word Count
                        </Typography>
                        <Typography variant="h3">
                          {agenciesList.reduce((sum, agency) => sum + (agency.wordCount || 0), 0).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
              loading={loadingTitles}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Title"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTitles ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              onChange={(event, newValue) => {
                handleTitleSelect(newValue);
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
                        {new Date(selectedTitle.latest_amended_on).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Latest Issue:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedTitle.latest_issue_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Up To Date As Of:</Typography>
                      <Typography variant="body1">
                        {new Date(selectedTitle.up_to_date_as_of).toLocaleDateString()}
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
              <TitleStructureTree 
                structure={titleStructure} 
                loading={loadingStructure} 
                error={error}
                onNodeClick={handleStructureNodeClick}
              />
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {selectedStructureNode ? (
              <RegulationDetails 
                loading={false} 
                data={selectedStructureNode} 
                error={null} 
              />
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
                loading={loadingTitles}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Title"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTitles ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  handleTitleSelect(newValue);
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
                          onClick={() => handleTitleSelect(selectedTitle)}
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
              {selectedTitle && (
                <RegulationVersionComparison
                  title={selectedTitle.number}
                  versions={versions}
                  loading={loadingVersions}
                  error={error}
                />
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
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select
                  value={correctionsFilter.title}
                  label="Title"
                  onChange={(e) => handleCorrectionsFilterChange('title', e.target.value)}
                >
                  <MenuItem value="">All Titles</MenuItem>
                  {titles.map((title) => (
                    <MenuItem key={title.number} value={title.number}>
                      Title {title.number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          
          <CorrectionsList
            corrections={corrections}
            loading={loadingCorrections}
            error={error}
          />
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
                    handleSearch();
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={agenciesList}
                  getOptionLabel={(option) => option.name || ''}
                  value={agenciesList.filter(agency => 
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
              </FormControl>
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
              <FormControl fullWidth>
                <InputLabel>Results Per Page</InputLabel>
                <Select
                  value={searchParams.per_page}
                  label="Results Per Page"
                  onChange={(e) => {
                    setSearchParams(prev => ({
                      ...prev,
                      per_page: e.target.value
                    }));
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || loadingSearch}
                startIcon={loadingSearch ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ py: 1 }}
              >
                {loadingSearch ? 'Searching...' : 'Search Regulations'}
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
                            startIcon={<LinkIcon />}
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
                        disabled={searchResults.meta.current_page <= 1 || loadingSearch}
                        onClick={() => {
                          setSearchParams(prev => ({
                            ...prev,
                            page: prev.page - 1
                          }));
                          handleSearch();
                        }}
                      >
                        Previous
                      </Button>
                      
                      <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Page {searchResults.meta.current_page} of {searchResults.meta.total_pages}
                      </Typography>
                      
                      <Button
                        disabled={searchResults.meta.current_page >= searchResults.meta.total_pages || loadingSearch}
                        onClick={() => {
                          setSearchParams(prev => ({
                            ...prev,
                            page: prev.page + 1
                          }));
                          handleSearch();
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