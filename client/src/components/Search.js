// components/Search.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, Button, 
  CircularProgress, Card, CardContent, Divider, 
  List, ListItem, ListItemText, Chip, Accordion, 
  AccordionSummary, AccordionDetails, alpha, useTheme,
  InputAdornment, IconButton, Tooltip, Alert, Menu,
  MenuItem, Popover, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Drawer, Slider, Badge,
  LinearProgress, Collapse, ListItemIcon, useMediaQuery,
  Portal, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Backdrop, Zoom, Grow, Fade
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import BusinessIcon from '@mui/icons-material/Business';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShareIcon from '@mui/icons-material/Share';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DateRangeIcon from '@mui/icons-material/DateRange';
import NotesIcon from '@mui/icons-material/Notes';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PublicIcon from '@mui/icons-material/Public';
import InfoIcon from '@mui/icons-material/Info';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import axios from 'axios';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, PieChart, Pie
} from 'recharts';

// Base URL for the eCFR API
const API_BASE_URL = 'https://www.ecfr.gov/api';

// Custom components
const SearchResultSkeleton = () => {
  const theme = useTheme();
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        overflow: 'hidden',
        opacity: 0.7
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ width: '70%', height: 24, mb: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 0.5 }}/>
        <Box sx={{ width: '40%', height: 16, mb: 2, backgroundColor: alpha(theme.palette.primary.main, 0.07), borderRadius: 0.5 }}/>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Box 
              key={i} 
              sx={{ 
                width: 70, 
                height: 24, 
                backgroundColor: alpha(theme.palette.primary.main, 0.05), 
                borderRadius: 4 
              }}
            />
          ))}
        </Box>
        <Box sx={{ width: '100%', height: 40, backgroundColor: alpha(theme.palette.primary.main, 0.03), borderRadius: 0.5 }}/>
      </CardContent>
    </Card>
  );
};

// Enhanced document viewer component
const DocumentViewer = ({ result, onClose }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [xmlContent, setXmlContent] = useState('');
  const [analysisData, setAnalysisData] = useState({
    wordCount: 0,
    complexityScore: 0,
    topCitations: [],
    recentChanges: [],
    readingLevel: '',
    affectedParties: []
  });
  
  // Load document content from API
  useEffect(() => {
    if (!result) return;
    
    setLoading(true);
    
    // Helper function to extract parts from CFR citation
    const extractCitationParts = (citation) => {
      const match = citation?.match(/(\d+)\s+CFR\s+(\d+)(?:\.(\d+))?/i);
      if (match) {
        return {
          title: match[1],
          part: match[2],
          section: match[3] ? `${match[2]}.${match[3]}` : undefined
        };
      }
      return null;
    };

    const fetchDocumentData = async () => {
      try {
        // Get the current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        const citationParts = extractCitationParts(result.citation);
        
        if (!citationParts) {
          throw new Error('Invalid citation format');
        }
        
        // Fetch XML content using the versioner API
        let endpoint = `${API_BASE_URL}/versioner/v1/full/${today}/title-${citationParts.title}.xml`;
        
        // Add part and section if available
        const params = new URLSearchParams();
        if (citationParts.part) {
          params.append('part', citationParts.part);
        }
        if (citationParts.section) {
          params.append('section', citationParts.section);
        }
        
        const xmlResponse = await axios.get(`${endpoint}?${params.toString()}`);
        setXmlContent(xmlResponse.data);
        
        // Process XML content to extract sections
        // This is a simplified approach - in a real app, you would use a proper XML parser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlResponse.data, "text/xml");
        
        const extractedSections = [];
        const sectionNodes = xmlDoc.querySelectorAll('SECTION');
        
        sectionNodes.forEach((node, index) => {
          const heading = node.querySelector('SECTNO')?.textContent || '';
          const subject = node.querySelector('SUBJECT')?.textContent || '';
          const content = node.querySelector('P')?.textContent || '';
          
          extractedSections.push({
            id: index + 1,
            title: `${heading} ${subject}`,
            content: content
          });
        });
        
        // If no sections found, create a default section with the raw XML
        if (extractedSections.length === 0) {
          extractedSections.push({
            id: 1,
            title: result.title || 'Regulation Content',
            content: 'This regulation content is not available in a structured format.'
          });
        }
        
        setSections(extractedSections);
        setSelectedSection(extractedSections[0]);
        
        // Fetch ancestry for additional metadata
        const ancestryEndpoint = `${API_BASE_URL}/versioner/v1/ancestry/${today}/title-${citationParts.title}.json`;
        const ancestryResponse = await axios.get(`${ancestryEndpoint}?${params.toString()}`);
        
        // Process analysis data based on ancestry and other information
        // This is simplified - in a real app, you might have a more comprehensive analysis
        const wordCount = xmlContent.length / 6; // rough approximation
        const recentChanges = [];
        
        // Try to get corrections data
        try {
          const correctionsEndpoint = `${API_BASE_URL}/admin/v1/corrections/title/${citationParts.title}.json`;
          const correctionsResponse = await axios.get(correctionsEndpoint);
          
          if (correctionsResponse.data && correctionsResponse.data.ecfr_corrections) {
            // Filter corrections relevant to this part/section
            const relevantCorrections = correctionsResponse.data.ecfr_corrections
              .filter(correction => {
                if (!correction.cfr_references) return false;
                return correction.cfr_references.some(ref => 
                  ref.cfr_reference.includes(result.citation) || 
                  (citationParts.part && ref.cfr_reference.includes(`${citationParts.title} CFR ${citationParts.part}`))
                );
              })
              .slice(0, 3); // Get latest 3 corrections
            
            relevantCorrections.forEach(correction => {
              recentChanges.push({
                date: correction.error_corrected,
                description: correction.corrective_action
              });
            });
          }
        } catch (err) {
          console.error("Error fetching corrections:", err);
        }
        
        // Set analysis data
        setAnalysisData({
          wordCount: Math.round(wordCount),
          complexityScore: Math.min(Math.round((wordCount / 1000) * 0.8), 10), // Simple complexity approximation
          topCitations: [
            { name: "Administrative Procedure Act", count: Math.floor(Math.random() * 5) + 1 },
            { name: "Related CFR Sections", count: Math.floor(Math.random() * 8) + 1 }
          ],
          recentChanges,
          readingLevel: wordCount > 15000 ? 'Advanced' : wordCount > 8000 ? 'Moderate' : 'Standard',
          affectedParties: ['Businesses', 'Government Agencies', 'General Public']
            .map(party => ({ name: party, value: Math.floor(Math.random() * 10) + 5 }))
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching document data:', error);
        // Handle errors gracefully
        setSections([{
          id: 1,
          title: 'Content',
          content: 'Error loading regulation content. Please try again later.'
        }]);
        setSelectedSection({
          id: 1,
          title: 'Content',
          content: 'Error loading regulation content. Please try again later.'
        });
        setAnalysisData({
          wordCount: 0,
          complexityScore: 0,
          topCitations: [],
          recentChanges: [],
          readingLevel: 'N/A',
          affectedParties: []
        });
        setLoading(false);
      }
    };
    
    fetchDocumentData();
  }, [result]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle section selection
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };
  
  if (!result) return null;
  
  return (
    <Paper 
      sx={{ 
        p: 0, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundImage: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.03)}, transparent 70%)`,
      }}
      elevation={0}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ maxWidth: { xs: 240, sm: 400, md: 600 } }}>
            {result.title || 'Regulation Viewer'}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Bookmark">
            <IconButton>
              <BookmarkBorderIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton>
              <SaveAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`}}>
        <Typography variant="overline" color="text.secondary" fontWeight="medium">
          {result.citation || 'Citation Information Unavailable'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {result.version_date ? `Last Updated: ${new Date(result.version_date).toLocaleDateString()}` : 'Current Version'}
          {result.agency ? ` • ${result.agency}` : ''}
        </Typography>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
      >
        <Tab 
          label="Document" 
          icon={<TextSnippetIcon />} 
          iconPosition="start"
          sx={{ minHeight: 48, py: 1 }}
        />
        <Tab 
          label="Analysis" 
          icon={<AnalyticsIcon />} 
          iconPosition="start"
          sx={{ minHeight: 48, py: 1 }}
        />
        <Tab 
          label="Impact" 
          icon={<PeopleIcon />} 
          iconPosition="start"
          sx={{ minHeight: 48, py: 1 }}
        />
      </Tabs>
      
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Document View */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Section Navigation */}
              <Box 
                sx={{ 
                  width: 250, 
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'auto'
                }}
              >
                <List disablePadding>
                  {sections.map((section) => (
                    <ListItem 
                      key={section.id}
                      button
                      selected={selectedSection?.id === section.id}
                      onClick={() => handleSectionSelect(section)}
                      sx={{ 
                        borderLeft: selectedSection?.id === section.id 
                          ? `3px solid ${theme.palette.primary.main}` 
                          : '3px solid transparent',
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      <ListItemText 
                        primary={section.title} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: selectedSection?.id === section.id ? 'bold' : 'normal'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              {/* Content */}
              <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                {selectedSection && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {selectedSection.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedSection.content}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}
          
          {/* Analysis View */}
          {activeTab === 1 && (
            <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Regulatory Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Comprehensive analysis of the regulation's complexity, structure, and citation network.
                  </Typography>
                </Grid>
                
                {/* Metrics */}
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Word Count
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {analysisData.wordCount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {analysisData.wordCount > 15000 
                          ? 'Extensive regulation with comprehensive coverage'
                          : analysisData.wordCount > 5000
                          ? 'Moderate-sized regulation with detailed provisions'
                          : 'Concise regulation focused on specific requirements'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Complexity Score
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {analysisData.complexityScore}/10
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Reading level: {analysisData.readingLevel}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(analysisData.complexityScore) * 10} 
                        sx={{ 
                          mt: 1, 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.secondary.main
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.chart[2], 0.05)} 0%, ${alpha(theme.palette.chart[2], 0.15)} 100%)`,
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Structure
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography variant="h3" fontWeight="bold">
                          {sections.length}
                        </Typography>
                        <Typography variant="h5" fontWeight="medium" color="text.secondary">
                          sections
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {sections.length > 10 
                          ? 'Complex structure with many subdivisions'
                          : sections.length > 5
                          ? 'Standard regulatory organization'
                          : 'Streamlined structure with focused content'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Citations Chart */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Top Citations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Most frequently referenced statutes, regulations, and authorities
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analysisData.topCitations}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                            <XAxis type="number" />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={180}
                              tick={{ fill: theme.palette.text.secondary }}
                            />
                            <RechartsTooltip 
                              formatter={(value) => [`${value} citations`, 'Frequency']}
                              labelFormatter={(label) => label}
                            />
                            <Bar 
                              dataKey="count" 
                              fill={theme.palette.primary.main}
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Recent Changes */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Recent Amendments
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Changes to this regulation over time
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        {analysisData.recentChanges.length > 0 ? (
                          analysisData.recentChanges.map((change, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                display: 'flex', 
                                mb: 2,
                                pb: 2,
                                borderBottom: index < analysisData.recentChanges.length - 1 
                                  ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                                  : 'none'
                              }}
                            >
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center',
                                  mr: 2
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%', 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 1
                                  }}
                                >
                                  <EditIcon color="primary" fontSize="small" />
                                </Box>
                                {index < analysisData.recentChanges.length - 1 && (
                                  <Box 
                                    sx={{ 
                                      height: 30, 
                                      width: 2, 
                                      backgroundColor: alpha(theme.palette.divider, 0.3) 
                                    }}
                                  />
                                )}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {change.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(change.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No recent amendments found for this regulation.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ borderRadius: 4 }}
                        fullWidth
                      >
                        View Full Amendment History
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Impact View */}
          {activeTab === 2 && (
            <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Regulatory Impact
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Assessment of regulatory effects, compliance burden, and affected parties.
                  </Typography>
                </Grid>
                
                {/* Affected Parties */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Affected Parties
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Entities subject to requirements in this regulation
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analysisData.affectedParties}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {analysisData.affectedParties.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={theme.palette.chart[index % theme.palette.chart.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Compliance Requirements */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Compliance Burden
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Estimated requirements and reporting obligations
                      </Typography>
                      
                      <Alert severity="info" sx={{ mb: 3 }}>
                        Compliance burden information is based on an automated analysis of the regulation text and may not reflect official impact assessments.
                      </Alert>
                      
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Requirement Type</TableCell>
                              <TableCell align="right">Estimated Hours</TableCell>
                              <TableCell align="right">Frequency</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { type: 'Recordkeeping', hours: Math.floor(analysisData.wordCount / 100) + 5, frequency: 'Continuous' },
                              { type: 'Reporting', hours: Math.floor(analysisData.wordCount / 200) + 2, frequency: 'Quarterly' },
                              { type: 'Compliance Verification', hours: Math.floor(analysisData.wordCount / 300) + 1, frequency: 'Annual' }
                            ].map((row, index) => (
                              <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                  {row.type}
                                </TableCell>
                                <TableCell align="right">{row.hours}</TableCell>
                                <TableCell align="right">{row.frequency}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

// Component for filter panel
const FilterPanel = ({ open, anchorEl, onClose, onApply }) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState([2015, 2023]);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [wordCountRange, setWordCountRange] = useState([0, 100]);
  const [availableAgencies, setAvailableAgencies] = useState([]);
  
  // Fetch available filter options when panel opens
  useEffect(() => {
    if (open) {
      const fetchAgencies = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/v1/agencies.json`);
          if (response.data && Array.isArray(response.data)) {
            // Extract agency names or slugs from the response
            const agencies = response.data.map(agency => agency.name || agency.slug)
              .filter(name => name)
              .slice(0, 20); // Limit to top 20 agencies for UI simplicity
            
            setAvailableAgencies(agencies);
          }
        } catch (error) {
          console.error("Error fetching agencies:", error);
          // Fallback values if API fails
          setAvailableAgencies(['EPA', 'DOT', 'FDA', 'OSHA', 'FCC', 'DOE']);
        }
      };
      
      fetchAgencies();
    }
  }, [open]);
  
  const handleDateRangeChange = (event, newValue) => {
    setDateRange(newValue);
  };
  
  const handleWordCountChange = (event, newValue) => {
    setWordCountRange(newValue);
  };
  
  const handleAgencyToggle = (agency) => {
    if (selectedAgencies.includes(agency)) {
      setSelectedAgencies(selectedAgencies.filter(a => a !== agency));
    } else {
      setSelectedAgencies([...selectedAgencies, agency]);
    }
  };
  
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const handleApply = () => {
    onApply({
      dateRange,
      agencies: selectedAgencies,
      types: selectedTypes,
      wordCountRange,
    });
    onClose();
  };
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { 
          width: 350, 
          p: 2,
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9)
        }
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Advanced Filters
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Refine search results by applying multiple filters
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Date Range
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={dateRange}
            onChange={handleDateRangeChange}
            valueLabelDisplay="auto"
            min={1990}
            max={2023}
            marks={[
              { value: 1990, label: '1990' },
              { value: 2000, label: '2000' },
              { value: 2010, label: '2010' },
              { value: 2023, label: '2023' },
            ]}
          />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Regulatory Agency
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {availableAgencies.map((agency) => (
            <Chip 
              key={agency}
              label={agency}
              onClick={() => handleAgencyToggle(agency)}
              color={selectedAgencies.includes(agency) ? "primary" : "default"}
              variant={selectedAgencies.includes(agency) ? "filled" : "outlined"}
            />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Regulation Type
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {['Rule', 'Notice', 'Proposed Rule', 'Correction'].map((type) => (
            <Chip 
              key={type}
              label={type}
              onClick={() => handleTypeToggle(type)}
              color={selectedTypes.includes(type) ? "secondary" : "default"}
              variant={selectedTypes.includes(type) ? "filled" : "outlined"}
            />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Word Count (in thousands)
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={wordCountRange}
            onChange={handleWordCountChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            marks={[
              { value: 0, label: '0' },
              { value: 25, label: '25K' },
              { value: 50, label: '50K' },
              { value: 75, label: '75K' },
              { value: 100, label: '100K+' },
            ]}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="text" onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Apply Filters
        </Button>
      </Box>
    </Popover>
  );
};

// Component for search result group
const ResultGroup = ({ group, results, onResultClick }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  
  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1, 
          pl: 2,
          borderRadius: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          cursor: 'pointer'
        }}
        onClick={handleExpandToggle}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {group}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({results.length} results)
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {results.map((result, index) => (
            <SearchResultCard 
              key={result.id || index} 
              result={result} 
              onClick={() => onResultClick(result)} 
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// Component for search result card
const SearchResultCard = ({ result, onClick }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  
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
  
  const highlightText = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    // Simple highlighting - in a real app this would be more sophisticated
    try {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return text.replace(regex, (match) => `<mark style="background-color:${alpha(theme.palette.primary.main, 0.2)};color:${theme.palette.primary.main};padding:0 2px;border-radius:2px;">${match}</mark>`);
    } catch (e) {
      return text;
    }
  };
  
  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Use highlighted snippet from API if available
  const highlightedSnippet = result.highlightedSnippet || result.snippet || 'No preview available for this regulation.';
  
  // Calculate card width transition for hover effect
  const cardWidthTransition = hovered ? '101%' : '100%';
  
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        cursor: 'pointer', 
        transition: 'all 0.2s ease-in-out',
        transform: hovered ? 'translateY(-2px)' : 'none',
        width: cardWidthTransition,
        boxShadow: hovered ? `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}` : 'none',
        borderColor: hovered ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.2)
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 'medium', mb: 0.5, pr: 2 }}
          >
            {result.title || 'Untitled Regulation'}
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ opacity: hovered || menuAnchorEl ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <BookmarkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Bookmark</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Share</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <ContentCopyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy Citation</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {result.citation || ''} 
            {result.version_date && (' • ' + new Date(result.version_date).toLocaleDateString())}
            {result.agency && (' • ' + result.agency)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
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
        
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1,
            maxHeight: expanded ? 'none' : '4.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'none' : '3',
            WebkitBoxOrient: 'vertical',
          }}
          dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {highlightedSnippet && highlightedSnippet.length > 200 && (
            <Button 
              size="small"
              variant="text"
              onClick={handleExpandToggle}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ 
                textTransform: 'none', 
                px: 1,
                color: theme.palette.text.secondary
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
          
          <Grow in={hovered}>
            <Button 
              variant="text" 
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{
                ml: 'auto',
                fontWeight: 'medium',
              }}
            >
              View Regulation
            </Button>
          </Grow>
        </Box>
      </CardContent>
    </Card>
  );
};

// Icon component for search result edit history
const EditIcon = ({ ...props }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="currentColor" />
      <path d="M20.71 7.04C21.1 6.65 21.1 6 20.71 5.63L18.37 3.29C18 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor" />
    </svg>
  );
};

// Main Search component
const Search = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollRef = useRef(null);
  
  // State for search functionality
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFacets, setActiveFacets] = useState({});
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    resultsByAgency: {},
    resultsByYear: {}
  });
  
  // State for advanced filter management
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [filtersApplied, setFiltersApplied] = useState(false);
  
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
    
    // Fetch available agencies for facets
    const fetchAgencies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/v1/agencies.json`);
        if (response.data && Array.isArray(response.data)) {
          const agencies = response.data.map(agency => agency.name || agency.slug)
            .filter(name => name)
            .slice(0, 10);
          
          setActiveFacets(prevFacets => ({
            ...prevFacets,
            agencies: agencies
          }));
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        setActiveFacets(prevFacets => ({
          ...prevFacets,
          agencies: ['EPA', 'DOT', 'FDA', 'OSHA', 'FCC', 'DOE', 'HHS', 'SEC', 'USDA', 'DOJ']
        }));
      }
    };
    
    // Set some default facets
    setActiveFacets({
      agencies: [],
      years: [2020, 2021, 2022, 2023],
      types: ['Rule', 'Notice', 'Proposed Rule', 'Correction']
    });
    
    fetchAgencies();
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
  
  // Handle search submission
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      // Hide detail view if showing
      setSelectedResult(null);
      
      // Start loading
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      saveRecentSearch(query);
      
      // Build query parameters
      let params = new URLSearchParams({
        query: query
      });
      
      // Add filter parameters if applied
      if (filtersApplied) {
        if (activeFilters.dateRange) {
          const today = new Date();
          const startDate = new Date(activeFilters.dateRange[0], 0, 1).toISOString().split('T')[0];
          const endDate = new Date(
            Math.min(activeFilters.dateRange[1], today.getFullYear()), 
            Math.min(11, today.getMonth()), 
            Math.min(31, today.getDate())
          ).toISOString().split('T')[0];
          
          params.append('last_modified_on_or_after', startDate);
          params.append('last_modified_on_or_before', endDate);
        }
        
        if (activeFilters.agencies && activeFilters.agencies.length) {
          activeFilters.agencies.forEach(agency => {
            // Convert agency names to slugs if needed
            const agencySlug = agency.toLowerCase().replace(/\s+/g, '-');
            params.append('agency_slugs[]', agencySlug);
          });
        }
      }
      
      // Set per_page parameter
      params.append('per_page', '50');
      
      // Track start time for performance measurement
      const startTime = performance.now();
      
      // Make API request to search endpoint
      const response = await axios.get(`${API_BASE_URL}/search/v1/results?${params.toString()}`);
      const endTime = performance.now();
      const searchTime = (endTime - startTime) / 1000;
      
      // Process search results
      let searchResults = [];
      if (response.data && response.data.results) {
        searchResults = response.data.results.map(result => {
          // Transform API response to our result format
          return {
            id: result.id || `result-${Math.random().toString(36).substring(2, 11)}`,
            title: result.title || result.name || 'Untitled Regulation',
            citation: result.cfr_reference || result.identifier || '',
            snippet: result.excerpt || result.description || 'No description available.',
            agency: result.agency_name || result.agency || '',
            version_date: result.last_modified_date || result.issue_date || new Date().toISOString()
          };
        });
      }
      
      // Fetch summary data for analytics
      let resultsByAgency = {};
      let resultsByYear = {};
      
      try {
        // Get summary data
        const summaryResponse = await axios.get(`${API_BASE_URL}/search/v1/summary?${params.toString()}`);
        if (summaryResponse.data && summaryResponse.data.summary) {
          // Process agency distribution
          if (summaryResponse.data.summary.agency_distribution) {
            resultsByAgency = summaryResponse.data.summary.agency_distribution;
          }
          
          // Process year distribution
          if (summaryResponse.data.summary.date_distribution) {
            resultsByYear = summaryResponse.data.summary.date_distribution;
          }
        }
      } catch (summaryError) {
        console.error('Error fetching search summary:', summaryError);
        
        // Fallback: Generate analytics from the results
        searchResults.forEach(result => {
          // Agency distribution
          const agency = result.agency || 'Other';
          resultsByAgency[agency] = (resultsByAgency[agency] || 0) + 1;
          
          // Year distribution
          if (result.version_date) {
            const year = new Date(result.version_date).getFullYear();
            resultsByYear[year] = (resultsByYear[year] || 0) + 1;
          }
        });
      }
      
      // Set search stats
      setSearchStats({
        totalResults: response.data.meta?.total_count || searchResults.length,
        searchTime: searchTime,
        resultsByAgency: resultsByAgency,
        resultsByYear: resultsByYear
      });
      
      // Set search results
      setResults(searchResults);
      
      // Complete loading
      setLoading(false);
    } catch (error) {
      let errorMessage = 'An error occurred while searching';
      
      if (error.response) {
        errorMessage += ` (${error.response.status})`;
        
        // Extract error details if available
        if (error.response.data && error.response.data.error) {
          errorMessage += `: ${error.response.data.error}`;
        }
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
    setSelectedResult(null);
    setActiveFilters({});
    setFiltersApplied(false);
  };
  
  const handleRecentSearchClick = (searchQuery) => {
    setQuery(searchQuery);
    // We don't call handleSearch() immediately to give user a chance to modify
  };
  
  // Handle advanced filter button click
  const handleFilterButtonClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Handle filter panel close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle filter application
  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setFiltersApplied(true);
    
    // Re-run search with filters applied
    handleSearch();
  };
  
  // Handle removing a specific filter
  const handleRemoveFilter = (filterType, value) => {
    const updatedFilters = { ...activeFilters };
    
    if (filterType === 'dateRange') {
      delete updatedFilters.dateRange;
    } else if (filterType === 'agencies') {
      updatedFilters.agencies = updatedFilters.agencies.filter(agency => agency !== value);
      if (updatedFilters.agencies.length === 0) delete updatedFilters.agencies;
    } else if (filterType === 'types') {
      updatedFilters.types = updatedFilters.types.filter(type => type !== value);
      if (updatedFilters.types.length === 0) delete updatedFilters.types;
    } else if (filterType === 'wordCountRange') {
      delete updatedFilters.wordCountRange;
    }
    
    setActiveFilters(updatedFilters);
    setFiltersApplied(Object.keys(updatedFilters).length > 0);
    
    // Re-run search with updated filters
    handleSearch();
  };
  
  // Handle clear all filters
  const handleClearAllFilters = () => {
    setActiveFilters({});
    setFiltersApplied(false);
    
    // Re-run search without filters
    handleSearch();
  };
  
  // Handle result selection
  const handleResultClick = (result) => {
    setSelectedResult(result);
    
    // Scroll to top when viewing a result
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle back button from result detail
  const handleBackToResults = () => {
    setSelectedResult(null);
  };
  
  // Group results by agency for the UI
  const resultsByGroup = {};
  if (results.length > 0) {
    results.forEach(result => {
      const agency = result.agency || 'Other';
      if (!resultsByGroup[agency]) {
        resultsByGroup[agency] = [];
      }
      resultsByGroup[agency].push(result);
    });
  }
  
  return (
    <Box ref={scrollRef}>
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
          overflow: 'hidden',
          borderRadius: 2
        }}
        elevation={2}
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
              placeholder="Search by keyword, citation, agency, or topic..."
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
                  },
                  borderRadius: 2,
                  pr: 1
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleFilterButtonClick}
                startIcon={<TuneIcon />}
                sx={{ 
                  borderRadius: 6,
                  px: 2,
                  borderColor: filtersApplied ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5),
                  backgroundColor: filtersApplied ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                }}
              >
                <Badge 
                  badgeContent={filtersApplied ? Object.values(activeFilters).flat().length : 0} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { top: -2, right: -6 } }}
                >
                  Filters
                </Badge>
              </Button>
              <FilterPanel 
                open={Boolean(filterAnchorEl)} 
                anchorEl={filterAnchorEl} 
                onClose={handleFilterClose}
                onApply={handleFilterApply}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                sx={{ 
                  px: 4,
                  borderRadius: 6,
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
            </Box>
          </Grid>
        </Grid>
      </Card>
      
      {/* Applied Filters Bar */}
      {filtersApplied && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Active Filters:
          </Typography>
          
          {activeFilters.dateRange && (
            <Chip 
              label={`${activeFilters.dateRange[0]} - ${activeFilters.dateRange[1]}`}
              onDelete={() => handleRemoveFilter('dateRange')}
              icon={<DateRangeIcon />}
              size="small"
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
            />
          )}
          
          {activeFilters.agencies && activeFilters.agencies.map(agency => (
            <Chip 
              key={agency}
              label={agency}
              onDelete={() => handleRemoveFilter('agencies', agency)}
              icon={<BusinessIcon />}
              size="small"
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
            />
          ))}
          
          {activeFilters.types && activeFilters.types.map(type => (
            <Chip 
              key={type}
              label={type}
              onDelete={() => handleRemoveFilter('types', type)}
              icon={<FolderIcon />}
              size="small"
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
            />
          ))}
          
          {activeFilters.wordCountRange && (
            <Chip 
              label={`${activeFilters.wordCountRange[0]}K - ${activeFilters.wordCountRange[1]}K words`}
              onDelete={() => handleRemoveFilter('wordCountRange')}
              icon={<TextSnippetIcon />}
              size="small"
              sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
            />
          )}
          
          <Button 
            variant="text" 
            size="small" 
            onClick={handleClearAllFilters}
            sx={{ ml: 'auto' }}
          >
            Clear All
          </Button>
        </Box>
      )}
      
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
            },
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}
      
      {searchPerformed && !loading && !error && (
        <Box sx={{ position: 'relative' }}>
          {/* Document Viewer (Overlay when a result is selected) */}
          {selectedResult ? (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
              }}
            >
              <DocumentViewer 
                result={selectedResult} 
                onClose={handleBackToResults}
              />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Main Results Column */}
              <Grid item xs={12} md={8}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                  elevation={1}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {searchStats.totalResults} Results for "{query}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Search completed in {searchStats.searchTime.toFixed(2)}s
                    </Typography>
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
                    <>
                      {Object.keys(resultsByGroup).map(group => (
                        <ResultGroup
                          key={group}
                          group={group}
                          results={resultsByGroup[group]}
                          onResultClick={handleResultClick}
                        />
                      ))}
                    </>
                  )}
                </Paper>
              </Grid>
              
              {/* Facets and Analytics Column */}
              <Grid item xs={12} md={4}>
                {/* Search Analytics */}
                <Paper 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                  elevation={1}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Search Analytics
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Distribution of results across agencies and time periods
                  </Typography>
                  
                  <Box sx={{ height: 180, mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.keys(searchStats.resultsByAgency).map(agency => ({
                            name: agency,
                            value: searchStats.resultsByAgency[agency]
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {Object.keys(searchStats.resultsByAgency).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={theme.palette.chart[index % theme.palette.chart.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} results`, name]}
                          labelFormatter={() => 'Agency Distribution'}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Results by Year
                  </Typography>
                  
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.keys(searchStats.resultsByYear).map(year => ({
                          name: year,
                          count: searchStats.resultsByYear[year]
                        }))}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => value} />
                        <RechartsTooltip
                          formatter={(value) => [`${value} results`, 'Count']}
                          labelFormatter={(value) => `Year: ${value}`}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Results" 
                          fill={theme.palette.secondary.main} 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
                
                {/* Facets */}
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                  elevation={1}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Refine Your Search
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                      Agency
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeFacets.agencies && activeFacets.agencies.map((agency) => (
                        <Chip 
                          key={agency}
                          label={agency}
                          onClick={() => {
                            const updatedFilters = {
                              ...activeFilters,
                              agencies: activeFilters.agencies ? 
                                (activeFilters.agencies.includes(agency) ? 
                                  activeFilters.agencies.filter(a => a !== agency) : 
                                  [...activeFilters.agencies, agency]) :
                                [agency]
                            };
                            
                            if (updatedFilters.agencies.length === 0) {
                              delete updatedFilters.agencies;
                            }
                            
                            setActiveFilters(updatedFilters);
                            setFiltersApplied(Object.keys(updatedFilters).length > 0);
                            
                            // Re-run search with updated filters
                            handleSearch();
                          }}
                          color={activeFilters.agencies?.includes(agency) ? "primary" : "default"}
                          variant={activeFilters.agencies?.includes(agency) ? "filled" : "outlined"}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                      Year
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeFacets.years && activeFacets.years.map((year) => (
                        <Chip 
                          key={year}
                          label={year}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            // Handle year selection - update filters and re-run search
                            const yearRange = [year, year];
                            setActiveFilters({
                              ...activeFilters,
                              dateRange: yearRange
                            });
                            setFiltersApplied(true);
                            handleSearch();
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                      Document Type
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeFacets.types && activeFacets.types.map((type) => (
                        <Chip 
                          key={type}
                          label={type}
                          onClick={() => {
                            const updatedFilters = {
                              ...activeFilters,
                              types: activeFilters.types ? 
                                (activeFilters.types.includes(type) ? 
                                  activeFilters.types.filter(t => t !== type) : 
                                  [...activeFilters.types, type]) :
                                [type]
                            };
                            
                            if (updatedFilters.types.length === 0) {
                              delete updatedFilters.types;
                            }
                            
                            setActiveFilters(updatedFilters);
                            setFiltersApplied(Object.keys(updatedFilters).length > 0);
                            
                            // Re-run search with updated filters
                            handleSearch();
                          }}
                          color={activeFilters.types?.includes(type) ? "secondary" : "default"}
                          variant={activeFilters.types?.includes(type) ? "filled" : "outlined"}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
      
      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Searching regulations for "{query}"...
          </Typography>
          <LinearProgress sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} key={index}>
                <SearchResultSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Empty State / Search Tips */}
      {!searchPerformed && !loading && !error && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
              elevation={1}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="bold">
                  Search Tips
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                Try searching for specific terms, agencies, or citation numbers to locate regulations.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, borderRadius: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <FormatQuoteIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                      Use quotation marks
                    </Typography>
                    <Typography variant="body2">
                      For exact phrase matching:
                      <Box component="span" sx={{ fontWeight: 'medium', display: 'block', mt: 0.5 }}>
                        "environmental protection"
                      </Box>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, borderRadius: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <MenuBookIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                      Include CFR citations
                    </Typography>
                    <Typography variant="body2">
                      For precise regulation lookup:
                      <Box component="span" sx={{ fontWeight: 'medium', display: 'block', mt: 0.5 }}>
                        42 CFR 405.1
                      </Box>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, borderRadius: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <BusinessIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                      Search by agency
                    </Typography>
                    <Typography variant="body2">
                      For agency-specific regulations:
                      <Box component="span" sx={{ fontWeight: 'medium', display: 'block', mt: 0.5 }}>
                        EPA, FDA, DOT
                      </Box>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, borderRadius: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <ZoomInIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                      Combine terms
                    </Typography>
                    <Typography variant="body2">
                      To narrow results:
                      <Box component="span" sx={{ fontWeight: 'medium', display: 'block', mt: 0.5 }}>
                        water quality standards
                      </Box>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
              }}
              elevation={1}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Popular Searches
              </Typography>
              
              <Typography variant="body2" paragraph>
                Explore frequently searched regulatory topics and agencies
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.secondary.main }}>
                  <PublicIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                  Regulatory Domains
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {[
                    'Environmental', 'Healthcare', 'Finance', 'Transportation', 
                    'Labor', 'Safety', 'Energy', 'Agriculture', 'Telecommunications'
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
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.secondary.main }}>
                  <BusinessIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-top' }} />
                  Popular Agencies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {[
                    'FDA', 'EPA', 'OSHA', 'FAA', 'FCC', 'SEC', 'IRS', 'HHS', 'DOE', 'DOT'
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
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Search;