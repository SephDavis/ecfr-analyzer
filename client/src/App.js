// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { 
  Container, AppBar, Toolbar, Typography, Box, 
  CircularProgress, Alert, Snackbar, Button,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  CssBaseline, useMediaQuery, IconButton, Divider,
  Tooltip
} from '@mui/material';

// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import components
import Dashboard from './components/Dashboard';
import AgencyAnalysis from './components/AgencyAnalysis';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import Search from './components/Search';
import ParticlesBackground from './components/ParticlesBackground';
import LogoPlaceholder from './components/LogoPlaceholder';

// Import theme
import theme from './theme';

// Import CSS
import './App.css';

// Conditionally import logo - falls back to placeholder if not available
let logo;
try {
  logo = require('./assets/logo.svg').default;
} catch (error) {
  console.log('Logo not found, using placeholder');
  logo = null;
}

// API URL - always use the production endpoint
const API_BASE_URL = 'https://ecfr-analyzer-production-ef73.up.railway.app';

function App() {
  const [loading, setLoading] = useState(true);
  const [agenciesData, setAgenciesData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshing, setRefreshing] = useState(false);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleDrawerClose = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      
      // Only use the API endpoints with the /api prefix
      const agenciesEndpoint = `${API_BASE_URL}/api/agencies`;
      const historicalEndpoint = `${API_BASE_URL}/api/historical`;
      
      const agenciesResponse = await axios.get(agenciesEndpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const historicalResponse = await axios.get(historicalEndpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      // Set the agency data directly from the response
      if (agenciesResponse && agenciesResponse.data) {
        setAgenciesData(agenciesResponse.data);
      } else {
        setError('Failed to load agency data');
        setAgenciesData([]);
      }
      
      // Set the historical data directly from the response
      if (historicalResponse && historicalResponse.data) {
        setHistoricalData(historicalResponse.data);
      } else {
        setError('Failed to load historical data');
        setHistoricalData([]);
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch data';
      if (error.response) {
        errorMessage += `: ${error.response.status} error`;
      } else if (error.request) {
        errorMessage += ': No response from server';
      } else {
        errorMessage += `: ${error.message}`;
      }
      setError(errorMessage);
      setAgenciesData([]);
      setHistoricalData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleCloseError = () => {
    setError(null);
  };

  const handleRefresh = () => {
    fetchData();
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Agencies', icon: <BusinessIcon />, path: '/agencies' },
    { text: 'Historical', icon: <TimelineIcon />, path: '/historical' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' }
  ];
  
  // Logo component (either imported or placeholder)
  const LogoComponent = () => {
    if (logo) {
      return (
        <Box 
          component="img" 
          src={logo} 
          alt="Reticuli Technologies" 
          sx={{ height: 40 }}
        />
      );
    } else {
      return <LogoPlaceholder height={40} />;
    }
  };
  
  // Drawer content
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <LogoComponent />
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={NavLink} 
            to={item.path}
            onClick={handleDrawerClose}
            sx={{
              mb: 1,
              borderRadius: 2,
              mx: 1,
              '&.active': {
                backgroundColor: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '& .MuiListItemText-primary': {
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(58, 123, 213, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
          © 2025 Reticuli Technologies — All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
  
  // If we're still loading and have no data
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
  
  // If we have an error and no data, show error
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
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ParticlesBackground density={30} />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
          {/* Drawer for navigation - permanent on desktop, temporary on mobile */}
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
              {drawer}
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
              {drawer}
            </Drawer>
          )}
          
          {/* Main content area */}
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* App bar - only visible on mobile for menu toggle */}
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
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </AppBar>
            
            {/* Page title bar - visible on desktop */}
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
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={refreshing ? '' : 'pulse'}
                >
                  {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Snackbar for errors */}
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
            
            {/* Main content */}
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
                <Route path="/search" element={<Search />} />
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
                © 2025 Reticuli Technologies — All Rights Reserved.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;