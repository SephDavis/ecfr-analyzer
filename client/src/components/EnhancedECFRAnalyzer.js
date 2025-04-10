// Enhanced eCFR Analyzer Integration Component
// This component integrates all the advanced AI/ML features

import React, { useState } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, Button, 
  Dialog, DialogContent, DialogTitle, IconButton,
  Card, CardContent, Grid, Divider, Chip, useTheme
} from '@mui/material';

// Import icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import SchemaIcon from '@mui/icons-material/Schema';
import CodeIcon from '@mui/icons-material/Code';
import LayersIcon from '@mui/icons-material/Layers';
import ApiIcon from '@mui/icons-material/Api';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorageIcon from '@mui/icons-material/Storage';

// Import enhanced components
// These paths would be adjusted to your project structure
import RegulatoryNLPDashboard from './RegulatoryNLPDashboard';
import SemanticSearchEngine from './SemanticSearchEngine';
import RegulatoryKnowledgeGraph from './RegulatoryKnowledgeGraph';

/**
 * EnhancedECFRAnalyzer - Advanced integration component that showcases AI/ML features
 * 
 * This component serves as a launcher for various advanced analytics features that
 * enhance the original eCFR Analyzer with cutting-edge NLP, semantic search, and
 * knowledge graph capabilities.
 * 
 * @param {Object} props
 * @param {Array} props.agenciesData - Data about regulatory agencies
 * @param {Array} props.historicalData - Historical regulatory data
 */
const EnhancedECFRAnalyzer = ({ agenciesData = [], historicalData = [] }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Function to handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Function to open a feature in dialog
  const handleOpenFeature = (feature) => {
    setSelectedFeature(feature);
    setDialogOpen(true);
  };
  
  // Function to close the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Helper function to create alpha version of a color
  const alpha = (color, value) => {
    // Simple alpha function since we don't have access to theme.alpha
    if (color.startsWith('#')) {
      return `${color}${Math.round(value * 255).toString(16).padStart(2, '0')}`;
    }
    return `rgba(${color}, ${value})`;
  };
  
  // Feature definitions for implemented features
  const advancedFeatures = [
    {
      id: 'nlp-dashboard',
      title: 'Regulatory NLP Analytics',
      description: 'Advanced machine learning analysis of federal regulations using natural language processing.',
      icon: <PsychologyIcon style={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      component: <RegulatoryNLPDashboard agenciesData={agenciesData} historicalData={historicalData} />,
      technologies: ['Natural Language Processing', 'Sentiment Analysis', 'Topic Modeling', 'Transformer Models', 'BERT']
    },
    {
      id: 'semantic-search',
      title: 'Semantic Search Engine',
      description: 'AI-powered search that understands the meaning and intent behind regulatory content.',
      icon: <SearchIcon style={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      component: <SemanticSearchEngine />,
      technologies: ['Neural Embeddings', 'Semantic Search', 'Vector Database', 'Query Expansion', 'Intent Recognition']
    },
    {
      id: 'knowledge-graph',
      title: 'Regulatory Knowledge Graph',
      description: 'Interactive visualization of the relationships between regulations, agencies, and requirements.',
      icon: <AccountTreeIcon style={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      component: <RegulatoryKnowledgeGraph />,
      technologies: ['Knowledge Graphs', 'Network Analysis', 'Graph Databases', 'Force-Directed Visualization', 'Relationship Mining']
    }
  ];
  
  // Additional feature concepts (not implemented)
  const conceptFeatures = [
    {
      id: 'regulatory-impact',
      title: 'Regulatory Impact Analysis',
      description: 'AI-driven analysis of economic and social impacts of regulations using predictive models.',
      icon: <InsightsIcon style={{ fontSize: 40 }} />,
      color: theme.palette.error.main,
      technologies: ['Predictive Modeling', 'Economic Impact Analysis', 'Causal Inference', 'Time Series Forecasting']
    },
    {
      id: 'compliance-assistant',
      title: 'AI Compliance Assistant',
      description: 'Interactive assistant that helps organizations navigate complex regulatory requirements.',
      icon: <AutoFixHighIcon style={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      technologies: ['Generative AI', 'Conversational AI', 'RAG Architecture', 'Decision Trees', 'Expert Systems']
    },
    {
      id: 'cross-agency',
      title: 'Cross-Agency Analysis',
      description: 'Identify regulatory overlaps, conflicts, and harmonization opportunities across agencies.',
      icon: <LayersIcon style={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      technologies: ['Cross-Document Coreference', 'Entity Linking', 'Conflict Detection', 'Policy Alignment Analysis']
    }
  ];
  
  // Render dialog content based on selected feature
  const renderDialogContent = () => {
    if (!selectedFeature) return null;
    
    const feature = advancedFeatures.find(f => f.id === selectedFeature);
    if (!feature) return null;
    
    return feature.component;
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              <RocketLaunchIcon sx={{ mr: 1, verticalAlign: 'top' }} />
              Advanced Analytics Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cutting-edge AI and machine learning tools to transform regulatory analysis
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<ScienceIcon />}
            sx={{ mt: 1 }}
          >
            About ML Technologies
          </Button>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Implemented Features" 
            iconPosition="start"
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Future Concepts" 
            iconPosition="start"
          />
          <Tab 
            icon={<CodeIcon />} 
            label="Technical Architecture" 
            iconPosition="start"
          />
        </Tabs>
        
        {/* Implemented Features Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {advancedFeatures.map((feature) => (
              <Grid item xs={12} md={4} key={feature.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 20px ${alpha(feature.color, 0.2)}`
                    },
                    background: `linear-gradient(135deg, ${alpha(feature.color, 0.05)} 0%, ${alpha(feature.color, 0.15)} 100%)`,
                    borderTop: `3px solid ${feature.color}`
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, color: feature.color, textAlign: 'center' }}>
                      {feature.icon}
                    </Box>
                    
                    <Typography variant="h6" gutterBottom align="center">
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" paragraph align="center">
                      {feature.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                      {feature.technologies.slice(0, 3).map((tech, idx) => (
                        <Chip 
                          key={idx} 
                          label={tech} 
                          size="small" 
                          sx={{ 
                            backgroundColor: alpha(feature.color, 0.1),
                            borderColor: alpha(feature.color, 0.3),
                            color: feature.color
                          }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleOpenFeature(feature.id)}
                      sx={{
                        backgroundColor: feature.color,
                        '&:hover': {
                          backgroundColor: feature.color
                        }
                      }}
                    >
                      Launch
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Future Concepts Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {conceptFeatures.map((feature) => (
              <Grid item xs={12} md={4} key={feature.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 20px ${alpha(feature.color, 0.2)}`
                    },
                    background: `linear-gradient(135deg, ${alpha(feature.color, 0.05)} 0%, ${alpha(feature.color, 0.15)} 100%)`,
                    borderTop: `3px solid ${feature.color}`
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, color: feature.color, textAlign: 'center' }}>
                      {feature.icon}
                    </Box>
                    
                    <Typography variant="h6" gutterBottom align="center">
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" paragraph align="center">
                      {feature.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, justifyContent: 'center' }}>
                      {feature.technologies.slice(0, 3).map((tech, idx) => (
                        <Chip 
                          key={idx} 
                          label={tech} 
                          size="small" 
                          sx={{ 
                            backgroundColor: alpha(feature.color, 0.1),
                            borderColor: alpha(feature.color, 0.3),
                            color: feature.color
                          }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth
                      disabled
                      sx={{
                        borderColor: feature.color,
                        color: feature.color,
                        '&.Mui-disabled': {
                          borderColor: alpha(feature.color, 0.3),
                          color: alpha(feature.color, 0.5)
                        }
                      }}
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Technical Architecture Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Advanced Machine Learning Architecture
            </Typography>
            
            <Typography variant="body2" paragraph>
              The enhanced eCFR Analyzer employs a sophisticated multi-tier architecture that leverages state-of-the-art machine learning models and advanced data processing techniques.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1 }} />
                      Data Layer
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" paragraph>
                        The foundation of our analytics engine is a specialized data layer that processes and indexes regulatory text.
                      </Typography>
                      
                      <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>
                          <Typography variant="body2">
                            <strong>Vector Database:</strong> Stores semantic embeddings for fast similarity search
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Graph Database:</strong> Maintains relationships between regulatory entities
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Document Store:</strong> Efficient storage and retrieval of regulatory text
                          </Typography>
                        </li>
                      </ul>
                    </Box>
                    
                    <Chip 
                      label="Neo4j + Pinecone + Elasticsearch" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <BubbleChartIcon sx={{ mr: 1 }} />
                      Model Layer
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" paragraph>
                        Our ML models extract insights and enhance search capabilities through advanced NLP techniques.
                      </Typography>
                      
                      <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>
                          <Typography variant="body2">
                            <strong>BERT-based Models:</strong> Fine-tuned for regulatory language
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Topic Models:</strong> Unsupervised learning for thematic analysis 
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Forecasting Models:</strong> Time series analysis with uncertainty quantification
                          </Typography>
                        </li>
                      </ul>
                    </Box>
                    
                    <Chip 
                      label="PyTorch + Hugging Face + Prophet" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <ApiIcon sx={{ mr: 1 }} />
                      API Layer
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" paragraph>
                        A robust API layer enables seamless integration between front-end components and ML capabilities.
                      </Typography>
                      
                      <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        <li>
                          <Typography variant="body2">
                            <strong>GraphQL API:</strong> Flexible querying of regulatory relationships 
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Vector Search API:</strong> Semantic similarity queries with ranking
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            <strong>Analysis API:</strong> On-demand regulatory text processing and analytics
                          </Typography>
                        </li>
                      </ul>
                    </Box>
                    
                    <Chip 
                      label="FastAPI + Apollo GraphQL + Redis" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
              <CardContent sx={{ p: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Technical Implementation Notes
                </Typography>
                <Typography variant="body2">
                  The eCFR Analyzer demonstrates several advanced AI/ML applications for regulatory analysis:
                </Typography>
                
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2">
                      <strong>Neural Text Embeddings:</strong> Regulatory text is encoded using BERT-based models to capture semantic relationships between regulations.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Knowledge Graph Construction:</strong> Automated extraction of entities and relationships from regulatory text creates a navigable graph structure.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Forecasting with Uncertainty:</strong> Bayesian time series models predict regulatory growth with confidence intervals.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      <strong>Compliance Burden Estimation:</strong> ML regression models estimate the time and cost impacts of regulatory requirements.
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
      
      {/* Feature Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { 
            height: '90vh',
            backgroundColor: 'background.default'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedFeature === 'nlp-dashboard' && <PsychologyIcon sx={{ mr: 1 }} />}
            {selectedFeature === 'semantic-search' && <SearchIcon sx={{ mr: 1 }} />}
            {selectedFeature === 'knowledge-graph' && <AccountTreeIcon sx={{ mr: 1 }} />}
            <Typography variant="h6">
              {advancedFeatures.find(f => f.id === selectedFeature)?.title || 'Advanced Feature'}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EnhancedECFRAnalyzer;