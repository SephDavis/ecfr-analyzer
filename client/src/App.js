// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, AppBar, Toolbar, Typography, Box, 
  Paper, Grid, CircularProgress, Alert, Snackbar, Button
} from '@mui/material';
import Dashboard from './components/Dashboard';
import AgencyAnalysis from './components/AgencyAnalysis';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import Search from './components/Search';
import './App.css';

// API URL - always use the production endpoint
const API_BASE_URL = 'https://ecfr-analyzer-production-ef73.up.railway.app';

// Log the API URL being used
console.log('Using API URL:', API_BASE_URL);

function App() {
  const [loading, setLoading] = useState(true);
  const [agenciesData, setAgenciesData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Only use the API endpoints with the /api prefix
        const agenciesEndpoint = `${API_BASE_URL}/api/agencies`;
        const historicalEndpoint = `${API_BASE_URL}/api/historical`;
        
        console.log(`Fetching agencies from: ${agenciesEndpoint}`);
        const agenciesResponse = await axios.get(agenciesEndpoint, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        console.log(`Fetching historical data from: ${historicalEndpoint}`);
        const historicalResponse = await axios.get(historicalEndpoint, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        // Set the agency data directly from the response
        if (agenciesResponse && agenciesResponse.data) {
          console.log(`Successfully loaded ${agenciesResponse.data.length} agencies`);
          setAgenciesData(agenciesResponse.data);
        } else {
          console.error('No agency data received from API');
          setError('Failed to load agency data');
          setAgenciesData([]);
        }
        
        // Set the historical data directly from the response
        if (historicalResponse && historicalResponse.data) {
          console.log(`Successfully loaded ${historicalResponse.data.length} historical records`);
          setHistoricalData(historicalResponse.data);
        } else {
          console.error('No historical data received from API');
          setError('Failed to load historical data');
          setHistoricalData([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Detailed error logging
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        
        setError(`Failed to fetch data: ${error.message}`);
        setAgenciesData([]);
        setHistoricalData([]);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCloseError = () => {
    setError(null);
  };
  
  // If we don't have data yet, show loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading data from API...
        </Typography>
      </Box>
    );
  }
  
  // If we have an error and no data, show error
  if (error && agenciesData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Failed to load data from the API. Please try again later.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </Box>
    );
  }
  
  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              eCFR Analyzer
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/agencies" className="nav-link">Agencies</Link>
              <Link to="/historical" className="nav-link">Historical</Link>
              <Link to="/search" className="nav-link">Search</Link>
            </Box>
          </Toolbar>
        </AppBar>
        
        {error && (
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseError} severity="warning" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
      </div>
    </Router>
  );
}

export default App;