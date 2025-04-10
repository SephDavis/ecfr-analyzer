// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, AppBar, Toolbar, Typography, Box, 
  Paper, Grid, CircularProgress, Alert, Snackbar
} from '@mui/material';
import Dashboard from './components/Dashboard';
import AgencyAnalysis from './components/AgencyAnalysis';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import Search from './components/Search';
import './App.css';

// Allow configuration of API URL via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecfr-analyzer-production-ef73.up.railway.app';

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
        
        // Try both API structures (with and without /api prefix)
        const endpoints = [
          { agencies: `${API_BASE_URL}/api/agencies`, historical: `${API_BASE_URL}/api/historical` },
          { agencies: `${API_BASE_URL}/agencies`, historical: `${API_BASE_URL}/historical` }
        ];
        
        let agenciesResponse = null;
        let historicalResponse = null;
        
        // Try each endpoint set until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying to fetch agencies from: ${endpoint.agencies}`);
            agenciesResponse = await axios.get(endpoint.agencies);
            
            if (agenciesResponse.data) {
              console.log('AGENCIES:', agenciesResponse.data);
              
              // Also try historical endpoint from the same endpoint set
              console.log(`Trying to fetch historical from: ${endpoint.historical}`);
              historicalResponse = await axios.get(endpoint.historical);
              console.log('HISTORICAL:', historicalResponse.data);
              
              // If both work, break out of the loop
              break;
            }
          } catch (endpointError) {
            console.error(`Error with endpoint ${endpoint.agencies}:`, endpointError);
            // Continue to next endpoint set
          }
        }
        
        // If we got agency data
        if (agenciesResponse && agenciesResponse.data) {
          // Ensure agencies data is an array
          const agencies = Array.isArray(agenciesResponse.data) 
            ? agenciesResponse.data 
            : (agenciesResponse.data.agencies || agenciesResponse.data.data || []);
          
          setAgenciesData(agencies);
        } else {
          throw new Error('No agency data could be fetched');
        }
        
        // If we got historical data
        if (historicalResponse && historicalResponse.data) {
          setHistoricalData(historicalResponse.data);
        } else {
          throw new Error('No historical data could be fetched');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch data: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCloseError = () => {
    setError(null);
  };
  
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
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
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
          )}
        </Container>
      </div>
    </Router>
  );
}

export default App;