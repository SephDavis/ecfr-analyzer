import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { 
  Container, AppBar, Toolbar, Typography, Box, 
  CircularProgress, Alert, Snackbar, Button,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  CssBaseline, useMediaQuery, IconButton, Divider,
  Tooltip, alpha
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Original Components
import Dashboard from './components/Dashboard';
import AgencyAnalysis from './components/AgencyAnalysis';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import ParticlesBackground from './components/ParticlesBackground';
import LogoPlaceholder from './components/LogoPlaceholder';

// Advanced AI Components 
import SemanticSearchEngine from './components/SemanticSearchEngine';
import EnhancedECFRAnalyzer from './components/EnhancedECFRAnalyzer';
import RegulatoryKnowledgeGraph from './components/RegulatoryKnowledgeGraph';
import RegulatoryNLPDashboard from './components/RegulatoryNLPDashboard';

// Theme and Styles
import theme from './theme';
import './App.css';

// API Configuration - Use existing configuration
const API_BASE_URL = 'https://ecfr-analyzer-production-ef73.up.railway.app';

// Extended Navigation Configuration with new items
const NAV_ITEMS = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/' 
  },
  { 
    text: 'Agencies', 
    icon: <BusinessIcon />, 
    path: '/agencies' 
  },
  { 
    text: 'Historical', 
    icon: <TimelineIcon />, 
    path: '/historical' 
  },
  { 
    text: 'Search', 
    icon: <SearchIcon />, 
    path: '/search' 
  },
  // New navigation items for advanced features
  { 
    text: 'AI Analytics', 
    icon: <RocketLaunchIcon />, 
    path: '/advanced-analytics' 
  },
  { 
    text: 'Knowledge Graph', 
    icon: <AccountTreeIcon />, 
    path: '/knowledge-graph' 
  },
  { 
    text: 'NLP Insights', 
    icon: <PsychologyIcon />, 
    path: '/nlp-insights' 
  }
];

// Logo Loader
const loadLogo = () => {
  try {
    return require('./assets/logo.svg').default;
  } catch {
    console.log('Logo not found, using placeholder');
    return null;
  }
};

function App() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [agenciesData, setAgenciesData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Responsive Design
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const logo = useMemo(loadLogo, []);

  // Data Fetching - Keep the existing implementation
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      
      const [agenciesResponse, historicalResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/agencies`, { 
          headers: { 'Cache-Control': 'no-cache' } 
        }),
        axios.get(`${API_BASE_URL}/api/historical`, { 
          headers: { 'Cache-Control': 'no-cache' } 
        })
      ]);
      
      setAgenciesData(agenciesResponse?.data || []);
      setHistoricalData(historicalResponse?.data || []);
    } catch (err) {
      const errorMessage = err.response 
        ? `${err.response.status} error` 
        : err.message || 'Failed to fetch data';
      
      setError(errorMessage);
      setAgenciesData([]);
      setHistoricalData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchData();
  }, []);

  // Event Handlers
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleDrawerClose = () => isMobile && setDrawerOpen(false);
  const handleCloseError = () => setError(null);

  // Logo Component
  const LogoComponent = () => (
    logo 
      ? <Box component="img" src={logo} alt="eCFR Analyzer" sx={{ height: 40 }} />
      : <LogoPlaceholder height={40} />
  );

  // Navigation Drawer Content
  const renderDrawerContent = () => (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <LogoComponent />
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <List sx={{ flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem 
            key={item.text} 
            component={NavLink} 
            to={item.path}
            onClick={handleDrawerClose}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '& .MuiListItemIcon-root': {
                color: 'text.secondary',
                transition: 'color 0.3s ease',
              },
              '& .MuiListItemText-primary': {
                color: 'text.secondary',
                transition: 'color 0.3s ease',
              },
              '&.active': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 Reticuli Technologies - All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );

  // Loading State
  if (loading && agenciesData.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ParticlesBackground density={20} />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            backgroundColor: 'background.default',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ mb: 4, height: 60 }}>
            <LogoComponent />
          </Box>
          <CircularProgress size={48} className="pulse" />
          <Typography variant="h6" sx={{ mt: 2, opacity: 0.7 }} className="fade-in">
            Loading eCFR Analyzer™
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Error State
  if (error && agenciesData.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ParticlesBackground density={20} />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            flexDirection: 'column',
            backgroundColor: 'background.default',
            p: 3,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ mb: 4, height: 60 }}>
            <LogoComponent />
          </Box>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              backgroundColor: 'rgba(211, 47, 47, 0.1)', 
              border: '1px solid rgba(211, 47, 47, 0.3)',
              width: '100%',
              maxWidth: 500
            }}
          >
            {error}
          </Alert>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Failed to load data from the API. Please try again later.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            className="glow"
          >
            Reload Application
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  // Main Application
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ParticlesBackground density={30} />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
          {/* Responsive Drawer */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={drawerOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: 280,
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {renderDrawerContent()}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                width: 280,
                flexShrink: 0,
                '& .MuiDrawer-paper': { 
                  width: 280, 
                  boxSizing: 'border-box',
                  backgroundColor: 'background.paper',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                },
              }}
              open
            >
              {renderDrawerContent()}
            </Drawer>
          )}
          
          {/* Main Content Area */}
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Mobile App Bar */}
            <AppBar 
              position="sticky" 
              sx={{ 
                display: { sm: 'none' },
                backgroundColor: 'background.paper',
                backgroundImage: 'none',
              }}
              elevation={0}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box sx={{ height: 32 }}>
                  <LogoComponent />
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh data">
                  <IconButton 
                    color="primary"
                    onClick={fetchData}
                    disabled={refreshing}
                  >
                    {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </AppBar>
            
            {/* Desktop Header */}
            <Box 
              sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Typography variant="h5" component="h1">
                eCFR Analyzer™
              </Typography>
              <Tooltip title="Refresh data">
                <IconButton 
                  color="primary"
                  onClick={fetchData}
                  disabled={refreshing}
                  className={refreshing ? '' : 'pulse'}
                >
                  {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Error Snackbar */}
            {error && (
              <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert 
                  onClose={handleCloseError} 
                  severity="warning" 
                  sx={{ width: '100%' }}
                >
                  {error}
                </Alert>
              </Snackbar>
            )}
            
            {/* Main Content */}
            <Container 
              maxWidth="xl" 
              sx={{ 
                mt: 4, 
                mb: 4, 
                flexGrow: 1,
                px: { xs: 2, sm: 3 },
              }}
              className="fade-in"
            >
              <Routes>
                {/* Original Routes */}
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      agenciesData={agenciesData} 
                      historicalData={historicalData} 
                    />
                  } 
                />
                <Route 
                  path="/agencies" 
                  element={<AgencyAnalysis agenciesData={agenciesData} />} 
                />
                <Route 
                  path="/historical" 
                  element={<HistoricalAnalysis historicalData={historicalData} />} 
                />
                
                {/* Replace the original Search with the enhanced SemanticSearchEngine */}
                <Route 
                  path="/search" 
                  element={<SemanticSearchEngine />} 
                />
                
                {/* New Routes for Advanced Features */}
                <Route 
                  path="/advanced-analytics" 
                  element={
                    <EnhancedECFRAnalyzer 
                      agenciesData={agenciesData} 
                      historicalData={historicalData} 
                    />
                  } 
                />
                <Route 
                  path="/knowledge-graph" 
                  element={<RegulatoryKnowledgeGraph />} 
                />
                <Route 
                  path="/nlp-insights" 
                  element={
                    <RegulatoryNLPDashboard 
                      agenciesData={agenciesData} 
                      historicalData={historicalData} 
                    />
                  } 
                />
              </Routes>
            </Container>
            
            {/* Footer */}
            <Box 
              component="footer" 
              sx={{ 
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: 'background.paper',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
               © 2025 Reticuli Technologies - All Rights Reserved
              </Typography>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;