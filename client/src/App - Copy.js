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
// In development, you might want to use a local URL
// For production, you'd set this in your deployment environment
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
        // This provides backward compatibility
        const endpoints = [
          { agencies: `${API_BASE_URL}/api/agencies`, historical: `${API_BASE_URL}/api/historical` },
          { agencies: `${API_BASE_URL}/agencies`, historical: `${API_BASE_URL}/historical` }
        ];
        
        let agenciesResponse = null;
        let historicalResponse = null;
        let errorMsg = '';
        
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
            errorMsg = endpointError.message;
            // Continue to next endpoint set
          }
        }
        
        // If we got agency data
        if (agenciesResponse && agenciesResponse.data) {
          // Check if data is in .agencies property (direct eCFR API format) or root array
          setAgenciesData(Array.isArray(agenciesResponse.data) 
            ? agenciesResponse.data 
            : agenciesResponse.data.agencies || []);
        } else {
          // Fallback to sample data if API failed
          setAgenciesData(generateSampleAgenciesData());
          console.warn('Using sample agency data since API request failed');
        }
        
        // If we got historical data
        if (historicalResponse && historicalResponse.data) {
          setHistoricalData(historicalResponse.data || []);
        } else {
          // Fallback to sample data if API failed
          setHistoricalData(generateSampleHistoricalData());
          console.warn('Using sample historical data since API request failed');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to fetch data: ${error.message}`);
        
        // Fallback to sample data on error
        setAgenciesData(generateSampleAgenciesData());
        setHistoricalData(generateSampleHistoricalData());
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate sample data for development/fallback
  const generateSampleAgenciesData = () => {
    const agencies = [];
    const names = [
      'Environmental Protection Agency', 
      'Department of Health and Human Services',
      'Department of Transportation',
      'Department of Labor',
      'Department of Treasury',
      'Federal Communications Commission',
      'Federal Trade Commission',
      'Consumer Financial Protection Bureau',
      'Securities and Exchange Commission',
      'Food and Drug Administration'
    ];
    
    for (let i = 0; i < names.length; i++) {
      const wordCount = Math.floor(Math.random() * 500000) + 100000;
      const regulationCount = Math.floor(Math.random() * 100) + 10;
      
      agencies.push({
        agencyId: `agency-${i}`,
        name: names[i],
        shortName: names[i].split(' ').pop(),
        displayName: names[i],
        slug: names[i].toLowerCase().replace(/[^a-z]+/g, '-'),
        wordCount,
        regulationCount,
        lastUpdated: new Date().toISOString(),
        cfrReferences: []
      });
    }
    
    return agencies;
  };
  
  const generateSampleHistoricalData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random word count that increases over time
      const baseCount = 1000000;
      const randomFactor = 1 + (Math.random() * 0.05 - 0.025); // -2.5% to +2.5%
      const totalWordCount = Math.round(baseCount * (1 + i/100) * randomFactor);
      
      data.push({
        date: date.toISOString(),
        totalWordCount,
        titleCounts: {},
        agencyCounts: {},
        changes: i === 0 ? [] : [
          {
            entity: 'Sample Agency',
            entityType: 'agency',
            wordDifference: Math.floor(Math.random() * 2000 - 1000) // -1000 to +1000
          }
        ]
      });
    }
    
    return data;
  };
  
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